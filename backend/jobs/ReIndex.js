/*

  Job to re-index data to elasticsearch

*/
module.exports = class ReIndexJob {

  constructor(logger, db, es, stackConfig)
  {

    this._db = db;
    this._es = es;
    this._config = stackConfig.es;
    this._logger = logger('app:jobs:re-index');
    this.handler = this.handler.bind(this);

  }

  getTopic()
  {
    return '/re-index';
  }

  async handler(message)
  {

    // convert to string
    const s = message ? message.toString() : message;

    if (!s) {
      this._logger.log('no message given, bouncing');
      return;
    }

    this._logger.log(`original message in the /re-index channel: ${s}`);
    try{

      switch (s.toLowerCase()) {
        case 'all':
          await this._reIndexAll();
          break;
        default:
          this._logger.log(`Unable to process re-index msg: ${s}`);
          return;
      }

    }
    catch (e) {
      this._logger.error(`Error re-indexing data`);
      this._logger.error(e);
    }

  }

  async _reIndexAll()
  {

    // TODO: see if indices exist first
    await this._es.createIndices();
    const maxRowsToIndex = 5000; // for each table

    // beers
    const beers = await this._db.beers.getAll(maxRowsToIndex);
    const beerIndex = config.getIndexForModel('beers');
    for (const b of beers) {
      await es.index(beerIndex, b);
    }
    logger.log(`${beers.length} beers indexed`);

    // brews
    const brews = await this._db.brews.getAll(maxRowsToIndex);
    const brewIndex = config.getIndexForModel('brews');
    for (const b of brews) {
      await es.index(brewIndex, b);
    }
    logger.log(`${brews.length} brews indexed`);

    // recipes
    const recipes = await this._db.recipes.getAll(maxRowsToIndex);
    const recipeIndex = config.getIndexForModel('recipes');
    for (const r of recipes) {
      await es.index(recipeIndex, r);
    }
    logger.log(`${recipes.length} recipes indexed`);

    // ingredients
    const ingredients = await this._db.recipes.getAllIngredients(maxRowsToIndex);
    const ingredientIndex = config.getIndexForModel('ingredients');
    for (const i of ingredients) {
      await es.index(ingredientIndex, i);
    }
    logger.log(`${ingredients.length} ingredients indexed`);

    // beer styles
    const styles = await this._db.beers.getAllStyles();
    const beerStyleIndex = config.getIndexForModel('beer_types');
    for (const s of styles) {
      await es.index(beerStyleIndex, s);
    }
    logger.log(`${styles.length} beer_styles indexed`);

    // brew notes
    const brewNotes = await this._db.brews.getAllBrewNotes(maxRowsToIndex);
    const brewNoteIndex = config.getIndexForModel('brew_notes');
    for (const n of brewNotes) {
      await es.index(brewNoteIndex, n);
    }
    logger.log(`${brewNotes.length} brew_notes indexed`);

    // brew_sensors
    const brewSensors = await this._db.brew_sensors.getAll(maxRowsToIndex);
    const brewSensorIndex = config.getIndexForModel('brew_sensor');
    for (const sensor of brewSensors) {
      await es.index(brewSensorIndex, sensor);
    }
    logger.log(`${brewSensors.length} brew_sensors indexed`);

  }


}
