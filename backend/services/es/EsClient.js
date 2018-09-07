const elasticsearch = require('elasticsearch');
const retry = require('async-retry').default;


/*

    The elasticsearch client

*/
module.exports = class EsClient {

    constructor(stackConfig, logger)
    {

        this._config = stackConfig.es;
        this._logger = logger('es:client');
        this._esClient = new elasticsearch.Client({
          host: this._config.host,
            log: 'error'
        });

    }

    async index(index, document)
    {

        if (!this._config.indexExists(index)) {
            throw new Error(`Unsupported Index ${index}`);
        }

        // index the document
        return await this._esClient.create({
            id: document.id,
            index: `${index}`,
            type: 'default',
            body: document
        });

    }

    async createMappings()
    {
        // todo
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
            term: { name: term }
          }
        }
      };

      const res = await this._esClient.search(searchParams);
      // console.log(res);

      return {
          results: res.hits.hits,
          page: from + 1,
          pages: Math.ceil(res.hits.total / pageSize)
      };

    }

    async queryAll()
    {
        const res = this._esClient.search({
            body: {
                query: {
                    match_all: { }
                }
            }
        });

        return res;
    }

    async putMappings(index, type)
    {
        const settings = {
            analysis: {
                analyzer: {
                    my_analyzer: {
                        type: "standard",
                        "stopwords": "_english_"
                    }
                }
            }
        };

        // 

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

