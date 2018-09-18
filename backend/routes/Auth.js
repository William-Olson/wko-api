
module.exports = class AuthRoutes
{
  constructor(harness, db, authManager, logger, mqtt)
  {
    this._db = db;
    this._authManager = authManager;
    const routes = harness(this);
    this._logger = logger('app:routes:auth');
    this._queue = mqtt;

    routes.post('/login', this.login);
    routes.get('/login', this.loginPage);
    routes.get('/queue', this.queueTest);
  }

  async queueTest(req)
  {

    const op = req.query.op;
    const topic = req.query.topic;
    const msg = req.query.msg;

    if (op == 'sub') {
      await this._queue.sub(topic, m => console.log(m.toString()));
      return { ok: true };
    }
    else {
      this._queue.pub(topic, msg);
      return { ok: true };
    }

  }


  /*

    Provide login page for testing auth services

  */
  async loginPage()
  {
    return `
      <form action="/auth/login" name="login" method="post">
          <div>
              <label>Username:</label>
              <input type="text" name="username"/>
          </div>
          <div>
              <label>Password:</label>
              <input type="password" name="password"/>
          </div>
          <div>
              <input type="submit" value="login"/>
          </div>
      </form>
    `;
  }

  async login(req)
  {
    const { username, password } = req.body;

    try {

      // check login success
      const success = await this._db.users.checkPassword(username, password);

      if (!success) {
        throw new Error(); // login fail
      }

      // fetch user
      const user = await this._db.users.getByUsername(username);

      // create new session / token
      const { token } = await this._authManager.createSession(user, req);
      return { token, ok: true };

    }
    catch (err) {
      this._logger.error(err);
      throw new Error('Bad Login Credentials');
    }

  }
};
