
const inflationHandlers = {

    'beers': async (db, id) => await db.beers.getById(id),
    'brews': async (db, id) => await db.brews.getById(id),
    'recipes': async (db, id) => await db.recipes.getById(id),
    'ingredients': async (db, id) => await db.recipes.getIngredientById(id),
    'brew_notes': async (db, id) => await db.brews.getBrewNoteById(id),
    'beer_styles': async (db, id) => await db.beers.getBeerTypeById(id),

};


module.exports = class EsInflation {

    constructor(db, logger, stackConfig) {
        this._config = stackConfig.es;
        this._logger = logger('es:inflation');
        this._db = db;
    }

    async inflateDocument(document)
    {

        if (!document || !document.id) {
            throw new Error(`Can't inflate document ${document}`);
        }

        const { id, index } = document;

        if (!this._config.indexExists(index)) {
            throw new Error(`No index named ${index}`);
        }

        const modelName = this._config.getIndexModel(index);
        if (!modelName) {
            throw new Error(`Can't find model associated to index ${index}`);
        }

        // inflate the doc
        const handler = inflationHandlers[modelName];
        if (!handler) {
            throw new Error(`Inflation Handler not implemented for model ${modelName}`);
        }

        return await handler(this._db, id);

    }

}