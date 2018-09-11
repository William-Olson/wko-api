const EsClient = require('./EsClient');
const EsInflation = require('./EsInflation');

/**
 * Inits the es (elasticsearch) service
 */
module.exports = class DataApiService
{
  constructor(container, db)
  {

    // register the elasticsearch client
    this._esInflation = container.new(EsInflation);
    container.registerValue('esInflation', this._esInflation);
    this._es = container.new(EsClient);
    container.registerValue('es', this._es);

    // expose this on db as well
    db._es = this._es;

  }

  async start()
  {
    await this._es.authenticate();
  }

};
