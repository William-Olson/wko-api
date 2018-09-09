const path = require('path');
const fs = require('fs');
const DATA_API_PATH = path.join(__dirname, '../../models');
const DATA_API_TAIL = '.js';


// read in db api filenames to an array
const apiFiles = fs.readdirSync(DATA_API_PATH);

/**
 * get a scope name based off a filename (converts any dashes to
 * underscores as well)
 */
const scopeName = fname =>
  fname.slice(0, fname.length - DATA_API_TAIL.length).replace(/\-/gim, '_');



/**
 * For loading up the data layer api
 */
module.exports = class DataApiLoader
{

  constructor(container, knex, logger)
  {
    this._container = container;
    this._knex = knex;
    this._db = {};
    this._logger = logger('db:api-loader');
  }

  /**
   * Loads and instantiates all api class files and registers them with scope
   * names based off filenames
   */
  createApi()
  {
    this._logger.log('creating data layer api...');

    for (let file of apiFiles) {
      const M = require(path.join(DATA_API_PATH, file));
      const name = scopeName(file);
      const m = this._container.new(M);
      
      // add _db prop to model instance
      m._db = this._db;

      // below might be overboard injection but w/e
      this._container.registerValue(name, m);

      this._db[name] = m;

      // common lightweight helper
      this._db[name].checkExists = async id => 
        await this._knex
          .from(name)
          .where({ id })
          .select('id')
          .first();

    }

    this._logger.log('data layer api created successfully!');

    // shortcuts
    this._db.knex = this._knex;
    this._db.authenticate = this._knex.authenticate;

    return this._db;
  }


};
