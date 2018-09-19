module.exports = class BrewSensorApi {

  constructor(knex, logger)
  {
    this._knex = knex;
    this._logger = logger('app:models:brew-sensor-api');
  }

  async getAll()
  {

    return await this._knex.table('brew_sensor as bs')
      .leftJoin('brew_sensor_read as bsr', 'bs.id', 'bsr.brew_sensor_id')
      .select([
        'bs.id',
        'bs.name',
        'bs.color',
        'bs.type',
        this._knex.raw('avg(bsr.metric::float) avg_sg'),
        this._knex.raw('min(bsr.metric::float) min_sg'),
        this._knex.raw('max(bsr.metric::float) max_sg'),
        this._knex.raw('min(bsr.temperature::float) min_temp'),
        this._knex.raw('max(bsr.temperature::float) max_temp'),
        this._knex.raw('avg(bsr.temperature::float) avg_temp'),
        this._knex.raw('count(bsr) data_points'),
        this._knex.raw('json_agg(bsr ORDER BY bsr.timestamp DESC) as data')
      ])
      .groupBy('bs.id')
      .orderBy(this._knex.raw('max(bsr.timestamp)'), 'desc');

  }

};