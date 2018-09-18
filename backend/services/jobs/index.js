const JobLoader = require('./JobLoader');

/*

  Inits the JobLoader Service

*/
module.exports = class JobsService
{

  constructor(container)
  {

    // create the job loader
    this._jobLoader = container.new(JobLoader);

  }

  async start()
  {

    // wire up the jobs
    this._jobLoader.registerJobs();

  }

};
