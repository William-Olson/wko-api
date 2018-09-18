const MqttClient = require('./MqttClient');

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

  }

  async start()
  {

    await this._mqtt.authenticate();
    await this._mqtt.listen();

  }

};
