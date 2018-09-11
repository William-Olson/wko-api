const elasticsearch = require('elasticsearch');
const retry = require('async-retry').default;
const curry = require('curry');

const indexSettings = require('./index-settings.json');
const indexMappings = require('./mappings.json');

/*

    The elasticsearch client

*/
module.exports = class EsClient {

    constructor(stackConfig, esInflation, logger)
    {

        this._config = stackConfig.es;
        this._esInflation = esInflation;
        this._logger = logger('app:es-client');
        this._esClient = new elasticsearch.Client({
          host: this._config.host,
            log: 'error'
        });

        this.getIndexFor = model => this._config.getIndexForModel(model);

        // create an api of index searches by model/index name
        for (const t of this._config.getTypes()) {
            this._logger.log('Creating ES api for: ' + t.model);
            this[t.model] = {
                search: curry(this.searchIndex.bind(this), t.index),
                index: curry(this.index.bind(this), t.index),
            };
            this[t.index] = this[t.model];
        }

    }

    async index(index, document)
    {

        if (!document || !document.id) {
            logger.kv('index', index)
                  .kv('document', document)
                  .error('Can\'t index. Bad document param');
            throw new Error('Bad document param');
        }

        if (!this._config.indexExists(index)) {
            throw new Error(`Unsupported Index ${index}`);
        }

        this._logger.kv('index', index).log(`Indexing document ${document.id}`);

        // index the document
        return await this._esClient.index({
            id: document.id,
            index: `${index}`,
            type: 'default',
            body: document
        });

    }

    async searchAllIndices(term, from, pageSize)
    {
        return await this.searchIndex('_all', term, from, pageSize);
    }

    async searchIndex(index, term, from, pageSize)
    {

      from = from || 0;
      pageSize = pageSize || 500;

      const searchParams = {
        index,
        from,
        size: pageSize,
        body: {
          query: {
            match: { name: term }
          }
        }
      };

      const res = await this._esClient.search(searchParams);

      if (res.error) {
        this.logger.kv('index', index).kv('term', term).error(res.error);
        return { Error: 'An error occurred' };
      }

      return {
        results: await this._esInflation.inflateDocuments(index, res.hits.hits),
        page: from + 1,
        pages: Math.ceil(res.hits.total / pageSize)
      };

    }

    async createIndices()
    {

      const settings = indexSettings.settings;
      
      for (const { index } of this._config.getTypes()) {
          const mappings = indexMappings[index];
          
          this._logger.log(`creating index ${index}`);
          await this._esClient.indices.create({ index, body: { settings, mappings } });
      }

    }

    async authenticate()
    {
        const task = async (exit, i) => {

            this._logger.kv('attempt', i).log(`es ping attempt: ${i}`);
            const res = await this._esClient.ping({
              requestTimeout: 1000,
            });
        
            if (!res && Array.isArray(res) && res[0].res) {
                this._logger.kv('res', res).log('es ping failure');
                throw new Error('failed to connect to elastic');
            }
    
        };
        const factor = 1.5;
        const maxTimeout = 15000;
    
        this._logger.log('...authenticating with elasticsearch');
        await retry(task, { maxTimeout, factor });
        this._logger.log('elasticsearch connection successful!');
    }

};

