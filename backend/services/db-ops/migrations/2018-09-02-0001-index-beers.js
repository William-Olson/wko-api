/*

  Index beer data from db

  Note: the entries are indexed one by one because there
        are only a couple of entries total, otherwise a
        bulk call should be implemented for large data
        set indexing operations

*/
module.exports = {

  async up({ db, es, logger, stackConfig })
  {
    const config = stackConfig.es;

    await es.createIndices();

    // beers

    const beers = await db.beers.getAll();
    const beerIndex = config.getIndexForModel('beers');
    for (const b of beers) {
        await es.index(beerIndex, b);
    }
    logger.log('beers indexed');

    // beer types

    const styles = await db.beers.getAllStyles();
    const beerStyleIndex = config.getIndexForModel('beer_types');
    for (const s of styles) {
        await es.index(beerStyleIndex, s);
    }
    logger.log('beer_styles indexed');

  }

};
