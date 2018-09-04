const Umzug = require('umzug');
const path = require('path');


/*

  Runs migrations

*/
module.exports = class DbOpsService
{
  constructor(db, container, logger, stackConfig, es)
  {
    this._logger = logger('db:migrations');
    this.um = new Umzug({
      storage: path.join(__dirname, './MigrationStorage.js'),
      storageOptions: { db, logger, stackConfig },
      migrations: {
        path: path.join(__dirname, './migrations'),
        wrap: fn => async () => await fn({ db, container, stackConfig, es, logger: this._logger })
      }
    });
  }

  async start()
  {
    const pending = await this.um.pending();
    this._logger.log(`currently ${pending.length} pending migrations`);

    // fire off migrations

    this._logger.log('executing migrations');

    try {
      await this.um.up();
    }
    catch(err) {
      console.error(err);
      process.exit(1);
    }

    this._logger.log('migrations complete');


    // kill when done
    process.exit(0);
  }
};
