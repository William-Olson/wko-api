
const inflationHandlers = {

    'wko-beer': {
        'beers': async (db, id) => await db.beers.getById(id),
        'brews': async (db, id) => await db.brews.getById(id),
        'recipes': async (db, id) => await db.recipes.getById(id),
        'ingredients': async (db, id) => await db.recipes.getIngredientById(id),
        'brew_notes': async (db, id) => await db.brews.getBrewNoteById(id),
        'beer_styles': async (db, id) => await db.beers.getBeerTypeById(id),
    }

};


module.exports = class EsInflation {

    constructor(db, logger, stackConfig) {
        this._TYPES = stackConfig.TYPES;
        this._logger = logger('es:inflation');
        this._db = db;
    }

    async inflateDocument(document)
    {

        if (!document || !document.id) {
            throw new Error(`Can't inflate document ${document}`);
        }

        const { id, index, type } = document;

        if (!this._TYPES[index]) {
            throw new Error(`No index named ${index}`);
        }

        if (!this._TYPES[index].includes(type)) {
            throw new Error(`Unsupported type ${type}`);
        }

        // inflate the doc
        const handler = inflationHandlers[index][type];
        if (!handler) {
            throw new Error(`Inflation Handler not implemented for type ${type}`);
        }

        return await handler(this._db, id);

    }

}