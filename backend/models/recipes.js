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

  async create(data)
  {

    if (!data || !data.name) {
      throw new Error('Missing name for recipe creation');
    }

    if (!data.ingredients || !data.ingredients.length) {
      throw new Error('Missing ingredients list for recipe creation');
    }

    const recipe = await this._knex
    .table('recipes')
    .insert({
      name: data.name,
      cost: data.cost,
      type_id: data.type_id
    }).returning('*');

    if (!recipe || !recipe.id) {
      throw new Error(`couldn't create recipe: ${data.name}`)
    }

    // add ingredients to recipe
    for (const ingredientId of data.ingredients) {
      // create ingredient link
      await this._knex.table('recipe_ingredients')
        .insert({
          recipe_id: recipe.id,
          ingredient_id: ingredientId
        });
    }

    return recipe;

  }


  async createIngredient(data)
  {

    if (!data || data.name) {
      throw new Error('Can\'t create ingredient. Missing name param!');
    }

    if (!data.type_id) {
      throw new Error(`Can't create ingredient ${data.name}. Missing type_id!`);
    }

    return await this._knex
      .table('ingredients')
      .insert({
        name: data.name,
        cost: data.cost,
        type_id: data.type_id
      });

  }

  async getIngredientById(id)
  {

    if (!id) {
      throw new Error('Can\'t fetch ingredient, Missing id param');
    }

    return await this._knex.table('ingredients')
      .where('id', id);

  }

}
