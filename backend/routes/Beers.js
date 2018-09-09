/*

  Routes for Beers

*/
module.exports = class BeersRoutes
{
  constructor(db, es, harness)
  {

    this._db = db;
    this._es = es;
    const routes = harness(this);

    routes.get('/search', this.search);
    routes.get('/', this.getBeers);

  }

  async getBeers()
  {

    return await this._db.beers.getAll();

  }

  async search(req)
  {
    try {
      const term = req.query.term;
      return await this._es.beers.search(term);
    }
    catch(e) {
      console.error(e);
    }

  }
};
