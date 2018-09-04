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
      .leftJoin('beers AS b', 'br.beer_id', 'b.id')
      .leftJoin('brew_phases AS phase', 'br.brew_phase_id', 'phase.id')
      .leftJoin('beer_types AS style', 'style.id', 'b.main_type_id')
      .leftJoin('beer_type_tags AS tag_ref', 'tag_ref.beer_id', 'b.id')
      .leftJoin('beer_types AS tag', 'tag_ref.type_id', 'tag.id')
      .where('br.id', id)
      .first([
        'br.*',
        'b.name AS beer_name',
        'style.name AS style',
        this._knex.raw(`COALESCE(json_agg(tag) FILTER (WHERE tag.id IS NOT NULL), '[]') AS tags`),
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

  async createBrewNote(data)
  {

    if (!data || !data.id) {
      throw new Error('Missing brew_id for brew_note creation');
    }

    return await this._knex
      .table('brew_notes')
      .insert({
        brew_id: data.brew_number,
        date: data.date,
        time: data.time,
        note: data.note,
        value: data.value,
        unit_type_id: data.unit_type_id
      });
  }


  async updateBrewNote(data)
  {
    if (!data.id) {
      throw new Error('Missing id for brew_notes update');
    }

    return await this._knex
      .table('brew_notes')
      .where({ id: data.id })
      .update({
        date: data.date,
        time: data.time,
        note: data.note,
        value: data.value,
        unit_type_id: data.unit_type_id
      });
  }

  async getNotesForBrewId(id)
  {
    if (!id) {
      throw new Error('Missing id param for retrieving brew_notes');
    }

    return await this._knex
      .table('brew_notes')
      .where('brew_id', id);
  }

  async getBrewNoteById(id)
  {
    if (!id) {
      throw new Error('Missing id param for retrieving brew_notes');
    }

    return await this._knex
      .table('brew_notes')
      .where('id', id);

  }

}
