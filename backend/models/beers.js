/*

  Beers db api

*/
module.exports = class BeersApi {

  constructor(knex)
  {
    this._knex = knex;
  }

  /*

    Get all the beers

  */
  async getAll(limit = 20, offset = 0)
  {

    return await this._knex
      .from('beers as b')
      .leftJoin('beer_type_tags as tg', 'b.id', 'tg.beer_id')
      .join('beer_types as style', 'style.id', 'b.main_type_id')
      .leftJoin('beer_types as tags', 'tg.type_id', 'tags.id')
      .select([
        'b.*',
        'style.name as style',
        this._knex.raw(`
          COALESCE (
            json_agg(tags)
            FILTER (WHERE tags.id IS NOT NULL), '[]')
            AS tags
        `)
      ])
      .groupBy([ 'b.id', 'style' ])
      .orderBy('b.updated_at')
      .limit(limit)
      .offset(offset);

  }

  async getBeerTypeById(id)
  {

    if (!id) {
      throw new Error(`Can't fetch beer style, Missing id param`);
    }

    return await this._knex.table('beer_types')
    .where('id', id);

  }

  async getAllStyles()
  {
    return await this._knex.table('beer_types');
  }

}
