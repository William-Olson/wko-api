const moment = require('moment');

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

  async handler(message)
  {

    // convert to string
    const s = message ? message.toString() : message;
    this._logger.log(`original message in the tilt channel: ${s}`);

    if (!s) {
      return;
    }

    try{

      // get objects to work with
      const [ tiltSensor, data, info ] = this._parseTiltData(s.split(','));

      // skip conditions
      if (!data.timestamp || !tiltSensor.name || tiltSensor.name === 'Untitled') {
        this._logger.log('skipping tilt entry missing either timestamp or name');
      }

      // find brew_sensor
      const [ existingBrewSensor ] = await this._db.knex.table('brew_sensor')
        .where('name', tiltSensor.name);

      // create new sensor if it doesn't exist and set the brew_sensor_id of the new reading
      this._logger.log('existing brewSensor:', existingBrewSensor);
      const brewSensor = existingBrewSensor ? existingBrewSensor : await this._createBrewSensor(tiltSensor);
      this._logger.log('brewSensor:', brewSensor);
      data.brew_sensor_id = brewSensor.id;
      info.brew_id = brewSensor.brew_id;

      // check if duplicate entry exists
      const [ readExists ] = await this._db.knex.table('brew_sensor_read')
        .where('timestamp', data.timestamp)
        .where('brew_sensor_id', data.brew_sensor_id);

      // bail on dupe
      if (readExists) {
        this._logger.log(`Duplicate reading found for brew sensor ${brewSensor.name} @ ${readExists.timestamp}`);
        return;
      }

      // log info
      this._logger.log(`parsed message in the tilt channel: ${JSON.stringify(info, null, 2 )}`);

      // save the reading to the database
      await this._db.knex.table('brew_sensor_read')
        .insert(data);

    }
    catch (e) {
      this._logger.error(`Error processing tilt data`);
      this._logger.error(e);
    }

  }

  _parseTiltData(fields)
  {

    const sensor = { };
    const sensorReading = { };

    // handle timestamp parsing, format: 2018-9-18 13:42:01
    if (fields[0]) {
      const m = moment(fields[0], 'YYYY-M-DD HH:mm:ss');
      sensorReading.timestamp = m.toDate();
    }

    // extract data
    sensor.name = fields[4];
    sensor.color = fields[5];
    sensorReading.timepoint = fields[1];
    sensorReading.temperature = fields[2];
    sensorReading.metric = fields[3];
    sensorReading.comment = fields[6];
    sensorReading.rssi = fields[7];
    sensorReading.uptime = fields[8];

    const info = Object.assign({
      momentTime: moment(sensorReading.timestamp).format('MMMM DD YYYY h:mm:ss')
    }, sensor, sensorReading);

    return [ sensor, sensorReading, info ];

  }

  async _createBrewSensor(sensor)
  {

    if (!sensor) {
      throw new Error('Missing sensor param');
    }

    // search for matching brew if name has trigger character
    if (sensor.name && sensor.name.includes('~')) {
      const brewInfo = sensor.name.split('~').map(n => n.trim());
      const [ brew ] = await this._db.knex.table('brews')
        .where('name', brewInfo[0])
        .where('batch_number', brewInfo[1]);
      sensor.brew_id = brew ? brew.id : null;
    }

    const [ newEntry ] = await this._db.knex.table('brew_sensor')
          .insert(sensor)
          .returning('*');

    return newEntry;

  }

}
