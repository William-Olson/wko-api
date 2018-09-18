const jobPath = '../../jobs';

const jobFiles = [
  'Tilt'
];

module.exports = class JobLoader {

  constructor(container, mqtt)
  {

    // loop folders and init jobs
    this._container = container;
    this._mqtt = mqtt;
    this._jobs = [ ];

  }

  registerJobs()
  {

    // TODO: make this dynamic

    // register each job
    for (const jf of jobFiles) {
      const job = this._container.new(require(`${jobPath}/${jf}`));
      this._mqtt.sub(job.getTopic(), job.handler);
      this._jobs.push(job);
    }

  }

}

