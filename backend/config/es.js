module.exports = {
  es: {
      host: process.env.ES_URL,

      // index types
      TYPES: {
          'wko-beer': [
            'beers',
            'brews',
            'recipes',
            'ingredients',
            'beer_styles',
            'brew_notes'
          ]
      }

  }
};
