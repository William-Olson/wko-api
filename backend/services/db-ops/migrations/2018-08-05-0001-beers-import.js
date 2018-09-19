/*

  Import beers table and types data

*/
module.exports = {

  async up({ db, logger })
  {

    await db.knex.table('beer_types')
        .insert([
          { id: 1, name: 'Saison' },
          { id: 2, name: 'Pale Ale' },
          { id: 3, name: 'Belgian Style Beer' },
          { id: 4, name: 'Brett Beer' },
          { id: 5, name: 'Sour Ale' },
          { id: 6, name: 'Oud Bruin' },
          { id: 7, name: 'Dark Beer' },
          { id: 8, name: 'Barrel Aged' }
        ]);

    logger.log('beer_types imported');

    await db.knex.table('beers')
        .insert([
            {
                id: 1,
                name: 'Scout Saison',
                main_type_id: 1,
                on_display: true,
                description: 'Light sour Saison with subtle Brett notes'
            },
            {
                id: 2,
                name: 'Roeselare Bruin',
                main_type_id: 6,
                on_display: true,
                description: 'Medium bodied dark beer. Slightly tart with notes of roasty malt and fruity esters.'
            }
        ]);

    logger.log('beers imported');

    await db.knex.table('beer_type_tags')
        .insert([
            { beer_id: 1, type_id: 1 },
            { beer_id: 1, type_id: 3 },
            { beer_id: 1, type_id: 4 },
            { beer_id: 1, type_id: 5 },
            { beer_id: 2, type_id: 3 },
            { beer_id: 2, type_id: 4 },
            { beer_id: 2, type_id: 5 },
            { beer_id: 2, type_id: 6 },
            { beer_id: 2, type_id: 7 }
        ]);

    logger.log('beer_type_tags imported');

  }
};
