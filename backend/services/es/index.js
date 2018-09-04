const EsClient = require('./EsClient');
const EsInflation = require('./EsInflation');

/**
 * Inits the es (elasticsearch) service
 */
module.exports = class DataApiService
{
  constructor(container)
  {

    // register the elasticsearch client
    this._esInflation = container.new(EsInflation);
    this._es = container.new(EsClient);
    container.registerValue('es', this._es);

  }

  async start()
  {
    await this._es.authenticate();
  }

};
