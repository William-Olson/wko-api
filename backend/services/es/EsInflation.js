const _ = require('lodash');

const inflationHandlers = {

    'beers': async (db, ids) => await db.beers.getByIds(ids),
    'brews': async (db, ids) => await db.brews.getByIds(ids),
    'recipes': async (db, ids) => await db.recipes.getByIds(ids),
    'ingredients': async (db, ids) => await db.recipes.getIngredientsByIds(ids),
    'brew_notes': async (db, ids) => await db.brews.getBrewNotesByIds(ids),
    'beer_styles': async (db, ids) => await db.beers.getBeerTypesByIds(ids),

};


module.exports = class EsInflation {

    constructor(db, logger, stackConfig) {
        this._config = stackConfig.es;
        this._logger = logger('app:es-inflation');
        this._db = db;
    }

    async inflateDocuments(index, documents) {
        this._logger.log(`inflating ${documents.length} for index ${index}`);
        for (const t of this._config.getTypes()) {
            console.log(t);
        }
        const ids = documents.map(d => d._source.id);
        const modelName = this._config.getIndexModel(index);
        const inflated = new Map();

        if (!modelName) {
            throw new Error(`Can't find model associated to index ${index}`);
        }

        // get handler
        this._logger.log(`fetching inflation handler for model ${modelName}`);
        const handler = inflationHandlers[modelName];
        if (!handler) {
            throw new Error(`Inflation Handler not implemented for model ${modelName}`);
        }

        // inflate into models
        const models =  await handler(this._db, ids);
        models.forEach(m => inflated.set(m.id, m));

        return documents.map(d => {
            d._source = inflated.get(d._source.id);
            return d;
        });

    }

    async inflateMixedDocuments(documents)
    {

        if (!documents || !documents.length) {
            throw new Error(`Can't inflate documents`);
        }

        // group indices
        const ids = { };
        for (const { index, _source } of documents) {
            if (!ids[index]) ids[index] = [ ];
            ids[index].push( _source.id)
        }

        // inflate models
        const inflated = new Map();
        for (const [ index, idArr ] in ids) {

            const modelName = this._config.getIndexModel(index);
            if (!modelName) {
                throw new Error(`Can't find model associated to index ${index}`);
            }
    
            // inflate the doc
            const handler = inflationHandlers[modelName];
            if (!handler) {
                throw new Error(`Inflation Handler not implemented for model ${modelName}`);
            }
    
            const models =  await handler(this._db, idArr);
            models.forEach(m => inflated.set(`${index}-${m.id}`, m));
        }

        // map back the inflated docs to their source object
        return documents.map(d => {
            d._source = inflated.get(`${d.index}-${d._source.id}`);
        })

    }

}