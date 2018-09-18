

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
    const data = { };

    try{
      const fields = s.split(',');
      data.timestamp = fields[0];
      data.t = fields[1];
      data.temperature = fields[2];
      data.metric = fields[3];
      data.name = fields[4];
      data.color = fields[5];
      data.rssi = fields[6];
      data.ocrssi = fields[7];
      this._logger.log(`got a message in the tilt channel: ${JSON.stringify(data, null, 2)}`);
      this._logger.log(`got a message in the tilt channel: ${fields}`);
    }
    catch (e) {
      this._logger.error(`Error processing tilt data`);
      this._logger.error(e);
      throw e;
    }

  }

}
