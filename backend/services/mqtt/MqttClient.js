const mqtt = require('mqtt');
const retry = require('async-retry').default;

module.exports = class MqttClient {

  constructor(stackConfig, logger)
  {
    const HOST = stackConfig.mqtt.host;

    this._logger = logger('app:mqtt');
    this._mqtt = mqtt;
    this._handlers = new Map();
    this._logger.log(`connecting to host ${HOST}`);
    this._client = this._mqtt.connect(HOST);
  }

  async _listenTo(topic)
  {

    return new Promise((res, rej) => {
      this._client.subscribe(topic, err => err ? rej(err) : res());
    });

  }

  pub(topic, message)
  {

    this._client.publish(topic, message);

  }

  sub(topic, handler)
  {

    // add the handler
    const h = this._handlers.get(topic);
    if (!h) {
      this._handlers.set(topic, [ handler ]);
    }
    else {
      h.push(handler);
      this._handlers.set(topic, h);
    }

    this._listenTo(topic)
      .catch(e => {
        this._logger.error(`Error registering topic ${topic}`);
        throw e;
      });

  }

  listen()
  {

    this._client.on('message', async (topic, message) => {
        const handlers = this._handlers.get(topic);

        if (!handlers || !handlers.length) {
          this._logger.error(`Missing handler for topic: ${topic}, (missed: ${message})`);
          setTimeout(() => { // retry 2 min later
            this._logger.log(`republishing to ${topic}: ${message}`);
            this.pub(topic, message);
          }, 60000 * 2);
        }

        try {

          // let each handler process the message
          for (const h of handlers) {
            await h(message);
          }

        }
        catch (e) {
          this._logger.error(`Handler for topic ${topic} failed`);
          this._logger.error(e);
        }

    });

  }

  async authenticate()
  {

    const task = async (exit, i) => {

      if (!this._client.connected) {
        this._client = this._client.reconnect();
        this._logger.kv('attempt', i).log(`failed connection attempt: ${i}, retrying`);
        throw new Error('mqtt failed to connect');
      }

    };

    const factor = 1.5;
    const maxTimeout = 15000;

    this._logger.log('...authenticating with mqtt');
    await retry(task, { maxTimeout, factor });
    this._logger.log('mqtt connection successful!');
  }

}