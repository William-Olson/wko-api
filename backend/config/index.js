module.exports = Object.assign(
  {},

  // external configs
  require('./server'),
  require('./db'),
  require('./es'),
  require('./mqtt'),

  // build info
  { build: require('./build-info.json') },

  { // overrides
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORE_SERVICES: 'logger,db',
    SERVICES: process.env.SERVICES || '',
    JWT_SECRET: process.env.JWT_SECRET
  }
);
