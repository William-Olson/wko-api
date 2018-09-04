/*

  Index beer data from db

*/
module.exports = {

    async up({ db, es, logger, stackConfig })
    {
  
    // beers
    const beers = await db.beers.getAll();
    for (const b of beers) {
        await es.index('wko-beer', 'beers', b);
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
    for (const s of styles) {
        await es.index('wko-beer', 'beer_styles', s);
    }
    logger.log('beer_styles indexed');

    //   // brew_notes
  
    //   logger.log('brew_notes indexed');

    }

};
