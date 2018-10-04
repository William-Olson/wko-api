/*

  Recipes db api

*/
module.exports = class RecipesApi {

  constructor(knex)
  {
    this._knex = knex;
  }

  /*

    Get all recipes

  */
  async getAll(limit = 20, offset = 0)
  {

    return await this._knex.from('recipes')
      .limit(limit)
      .offset(offset);

  }

  async getById(id)
  {

    if (!id) {
      throw new Error('Missing id param fetching recipe by id');
    }

    return await this._knex
      .table('recipes')
      .where('id', id)
      .first()

  }

  async getByIds(ids)
  {

    if (!ids) {
      throw new Error('Missing ids param fetching recipe by ids');
    }

    return await this._knex
      .table('recipes')
      .whereIn('id', ids);

  }

  async create(data)
  {

    if (!data || !data.name) {
      throw new Error('Missing name for recipe creation');
    }

    if (!data.ingredients || !data.ingredients.length) {
      throw new Error('Missing ingredients list for recipe creation');
    }

    const [ recipe ] = await this._knex
    .table('recipes')
    .insert({
      name: data.name,
      cost: data.cost,
      type_id: data.type_id
    }).returning('*');

    if (!recipe || !recipe.id) {
      throw new Error(`couldn't create recipe: ${data.name}`)
    }

    // add ingredients for recipe
    await this._knex.table('recipe_ingredients')
      .insert(data.ingredients.map(id => ({
        ingredient_id: id,
        recipe_id: recipe.id
      })));

    const newRecipe = await this.getById(recipe.id);
    await this._db._es.recipes.index(newRecipe);

    return newRecipe;

  }


  async createIngredient(data)
  {

    if (!data || data.name) {
      throw new Error('Can\'t create ingredient. Missing name param!');
    }

    if (!data.type_id) {
      throw new Error(`Can't create ingredient ${data.name}. Missing type_id!`);
    }

    const [ id ] = await this._knex
      .table('ingredients')
      .insert({
        name: data.name,
        cost: data.cost,
        type_id: data.type_id
      }).returning('id');

    if (!id) {
      throw new Error('Couldn\'t create ingredient');
    }

    const ingredient = await this.getIngredientById(id);
    await this._es.ingredients.index(ingredient);
    return ingredient;

  }

  async getIngredientById(id)
  {

    if (!id) {
      throw new Error('Can\'t fetch ingredient, Missing id param');
    }

    return await this._knex.table('ingredients')
      .where('id', id).first('*');

  }

  async getIngredientsByIds(ids)
  {

    if (!ids) {
      throw new Error('Can\'t fetch ingredients, Missing ids param');
    }

    return await this._knex.table('ingredients')
      .whereIn('id', ids);

  }

  async getAllIngredients(limit = 20, offset = 0) {

    return await this._knex.table('ingredients')
      .limit(limit)
      .offset(offset);

  }

}
