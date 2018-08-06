/*

  Brews db api

*/
module.exports = class BrewsApi {

  constructor(knex)
  {
    this._knex = knex;
  }

  /*

    Get all the brews

  */
  async getAll(limit = 20, offset = 0)
  {

    return await this._knex.from('brews')
      .limit(limit)
      .offset(offset);

  }

  /*

    Get details of a brew by its id

  */
  async getById(id)
  {

    return await this._knex.from('brews AS br')
      .join('beers AS b', 'br.beer_id', 'b.id')
      .join('brew_phases AS phase', 'br.brew_phase_id', 'phase.id')
      .join('beer_types AS style', 'style.id', 'b.main_type_id')
      .leftJoin('beer_type_tags AS tag_ref', 'tag_ref.beer_id', 'b.id')
      .join('beer_types AS tag', 'tag_ref.type_id', 'tag.id')
      .where('br.id', id)
      .select([
        'br.*',
        'b.name AS beer_name',
        'style.name AS style',
        this._knex.raw('json_agg(tag) AS tags'),
        'phase.name AS phase'
      ])
      .groupBy([
        'br.id',
        'br.name',
        'b.name',
        'style.name',
        'phase.name'
      ])

  }

  async create(data)
  {
    return await this._knex
      .table('brews')
      .insert({
        name: data.name,
        brew_date: data.brew_date,
        og: data.og,
        fg: data.fg,
        abv: data.abv,
        ibu: data.ibu,
        gone: data.gone,
        batch_number: data.batch_number,
        brew_number: data.brew_number,
        beer_id: data.beer_id,
        brew_phase_id: data.brew_phase_id,
        recipe_id: data.recipe_id
      });
  }

  async update(data)
  {
    if (!data.id) {
      throw new Error('Missing id for brew update');
    }

    return await this._knex
      .table('brews')
      .where({ id: data.id })
      .update({
        name: data.name,
        brew_date: data.brew_date,
        og: data.og,
        fg: data.fg,
        abv: data.abv,
        ibu: data.ibu,
        gone: data.gone,
        batch_number: data.batch_number,
        brew_number: data.brew_number,
        beer_id: data.beer_id,
        brew_phase_id: data.brew_phase_id,
        recipe_id: data.recipe_id
      });
  }

}
