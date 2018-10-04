const Immutable = require('immutable');

const TYPES = [
  Immutable.Map({ index: 'beers', model: 'beers' }),
  Immutable.Map({ index: 'brews', model: 'brews' }),
  Immutable.Map({ index: 'recipes', model: 'recipes' }),
  Immutable.Map({ index: 'ingredients', model: 'ingredients' }),
  Immutable.Map({ index: 'beer_styles', model: 'beer_types' }),
  Immutable.Map({ index: 'brew_notes', model: 'brew_notes' }),
  Immutable.Map({ index: 'brew_sensors', model: 'brew_sensor' }),
];

module.exports = {
  es: {
      host: process.env.ES_URL,

      getIndexForModel(m)
      {
        const entry = TYPES.find(e => e.get('model') === m);
        return entry ? entry.get('index') : null;
      },

      getIndexModel(i)
      {
        const entry = TYPES.find(e => e.get('index') === i);
        console.log('found entry', entry);
        console.log('entries', JSON.stringify(TYPES, null, 2))
        return entry ? entry.get('model') : null;
      },

      indexExists(i) {
        return !!(TYPES.find(e => e.get('index') === i));
      },

      // index types
      getTypes()
      {
        return TYPES.map(t => ({
          index: t.get('index'),
          model: t.get('model')
        }));
      }

  }
};
