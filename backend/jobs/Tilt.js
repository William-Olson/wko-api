

module.exports = class TiltJob {

  constructor(logger, db, es)
  {

    this._db = db;
    this._es = es;
    this._logger = logger('app:jobs:tilt');
    this.handler = this.handler.bind(this);

  }

  getTopic()
  {
    return '/tilt';
  }

  handler(message)
  {

    // todo
    const s = message ? message.toString() : message;
    this._logger.log(`got a message in the tilt channel: ${s}`);

  }

}