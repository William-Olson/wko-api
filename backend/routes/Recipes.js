/*

  Routes for Recipes

*/
module.exports = class RecipesRoutes
{
  constructor(db, harness)
  {

    this._db = db;
    const routes = harness(this);

    routes.get('/', this.getRecipes);
    routes.get('/:id', this.getRecipeById);
    routes.post('/ingredient', this.createIngredient);
    routes.post('/', this.createRecipe);

  }

  async getRecipes()
  {

    return await this._db.recipes.getAll();

  }

  async getRecipeById(req)
  {

    return await this._db.recipes.getById(req.params.id);

  }

  async createRecipe(req)
  {

    const data = req.body;

    if (!data.name) {
      throw new Error('name field required');
    }

    return await this._db.recipes.create(data);

  }


  async createIngredient(req)
  {

    const data = req.body;

    if (!data.name) {
      throw new Error('name field required');
    }

    return await this._db.recipes.createIngredient(data);

  }

};
