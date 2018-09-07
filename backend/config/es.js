module.exports = {
  es: {
      host: process.env.ES_URL,

      getIndexForModel(m)
      {
        const entry = this.TYPES.find(e => e.model === m);
        return entry ? entry.index : null;
      },

      getIndexModel(i)
      {
        const entry = this.TYPES.find(e => e.index = i);
        return entry ? entry.model : null;
      },

      indexExists(i) {
        return !!(this.TYPES.find(e => e.index = i));
      },

      // index types
      TYPES: [
        { index: 'beers', model: 'beers' },
        { index: 'brews', model: 'brews' },
        { index: 'recipes', model: 'recipes' },
        { index: 'ingredients', model: 'ingredients' },
        { index: 'beer_styles', model: 'beer_types' },
        { index: 'brew_notes', model: 'brew_notes' }
      ]
  }
};
