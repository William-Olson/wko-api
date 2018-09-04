const elasticsearch = require('elasticsearch');
const retry = require('async-retry').default;


/*

    The elasticsearch client

*/
module.exports = class EsClient {

    constructor(stackConfig, logger)
    {

        this._TYPES = stackConfig.es.TYPES;
        this._config = stackConfig.es;
        this._logger = logger('es:client');
        this._esClient = new elasticsearch.Client({
          host: this._config.host,
          //   log: 'off'
        });

    }

    async index(index, type, document)
    {

        if (!this._TYPES[index]) {
            throw new Error(`Unsupported Index ${index}`);
        }

        if (!this._TYPES[index].includes(type)) {
            this._logger.kv('document', document)
                .kv('index', index)
                .kv('type', type)
                .kv('TYPES', this._TYPES[index])
                .error(`Can't index, unsupported document type: ${type}`);
            
            throw new Error(`Unsupported type for index ${index}: ${type}`);
        }

        // index the document
        return await this._esClient.create({
            id: document.id,
            index: `${index}-${type}`,
            type,
            body: document
        });

    }

    async createMappings()
    {
        // todo
    }

    async search(index, term, from, pageSize)
    {

      from = from || 0;
      pageSize = pageSize || 500;

      const searchParams = {
        // index: index,
        from,
        size: pageSize,
        body: {
          query: {
            filtered: {
              query: {
                match: {
                    // match the query against all of
                    // the fields in this index
                    _all: term
                }
              }
            }
          }
        }
      };

      const res = this._esClient.search(searchParams);
      
      return {
          results: res.hits.hits,
          page: from + 1,
          pages: Math.ceil(res.hits.total / perPage)
      };

    }

    async authenticate()
    {
        const task = async (exit, i) => {

            this._logger.kv('attempt', i).log(`es connection attempt: ${i}`);
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

