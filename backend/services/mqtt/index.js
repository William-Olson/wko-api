const MqttClient = require('./MqttClient');
const JobLoader = require('./JobLoader');

/*

  Inits the MQTT Client Service

*/
module.exports = class MqttService
{

  constructor(container)
  {

    // create the mqtt instance
    this._mqtt = container.new(MqttClient);

    // register service
    container.registerValue('mqtt', this._mqtt);

    // create the job loader
    this._jobLoader = container.new(JobLoader);

  }

  async start()
  {

    await this._mqtt.authenticate();
    await this._mqtt.listen();

    // wire up the jobs
    this._jobLoader.registerJobs();

  }

};
