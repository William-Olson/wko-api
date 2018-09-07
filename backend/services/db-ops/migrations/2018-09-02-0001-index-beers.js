/*

  Index beer data from db

*/
module.exports = {

  async up({ db, es, logger, stackConfig })
  {
    const config = stackConfig.es;
  
    // beers
    const beers = await db.beers.getAll();
    const beerIndex = config.getIndexForModel('beers');
    for (const b of beers) {
        await es.index(beerIndex, b);
    }
    logger.log('beers indexed');

    //   // brews
  
    //   logger.log('brews indexed');

    //   // recipes
  
    //   logger.log('recipes indexed');

    //   // ingredients
  
    //   logger.log('ingredients indexed');
  
    // beer_styles

    const styles = await db.beers.getAllStyles();
    const beerStyleIndex = config.getIndexForModel('beer_types');
    for (const s of styles) {
        await es.index(beerStyleIndex, s);
    }
    logger.log('beer_styles indexed');

    //   // brew_notes
  
    //   logger.log('brew_notes indexed');

  }

};
