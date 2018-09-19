/*

  Create Tables for brew_sensor and brew_sensor_read

*/
module.exports = {

  async up({ db, logger })
  {

    // beers
    await db.knex.schema.createTableIfNotExists('brew_sensor', table => {
      table.increments();
      table.text('name');
      table.text('type');
      table.text('color');
      table.integer('brew_id').references('brews.id');
      table.timestamps(true, true);
    });

    logger.log('brew_sensor table created');

    await db.knex.table('brew_sensor')
      .insert({
        name: 'Water Test',
        type: 'tilt',
        color: 'black',
        brew_id: null
      });

    // brew_sensor_reads
    await db.knex.schema.createTableIfNotExists('brew_sensor_read', table => {
      table.increments();
      table.text('comment');
      table.text('metric');
      table.text('temperature');
      table.double('rssi');
      table.double('timepoint');
      table.integer('uptime');
      table.timestamp('timestamp');
      table.integer('brew_sensor_id').references('brew_sensor.id');
    });

    logger.log('brew_sensor_read table created');

  }

};
