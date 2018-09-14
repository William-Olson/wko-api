const WEB_HOST_ID = 3;
module.exports = class UsersRoutes
{
  constructor(harness, db)
  {
    this._users = db.users;
    this._db = db;
    const routes = harness(this);

    routes.get('/', this.fetchAll);
    routes.get('/me', this.me);
    routes.get('/:id', this.fetchById);
    routes.post('/', this.createUser);
    routes.post('/password', this.adminPasswordChange);
  }

  /*

    Get all users

  */
  async fetchAll()
  {

    return await this._users.getAll();

  }

  async me(req)
  {

    return await this._db.users.getById(req.user.id);

  }

  /*

    Get a user by id

  */
  async fetchById(req)
  {

    const id = req.params.id;
    return await this._users.getById(id);

  }

  /*

    Throw an error if user is not an admin

  */
  async _adminCheck(user)
  {

    const isAdmin = await this._db.flags.isAdmin(user.id);

    if (!isAdmin) {
      throw new Error('Unauthorized');
    }

  }

  /*

    Create a new user

  */
  async createUser(req)
  {

    await this._adminCheck(req.user);

    const newUserData = {
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      host_id: WEB_HOST_ID
    };

    const user = await this._users.create(newUserData);

    console.log('USER JUST CREATED:', user);

    if (req.body.admin) {
      await this._db.flags.newAdmin(user.id);
    }

    return user;

  }

  /*

    Change a user's password

    Note: need to eventually remove this or
          check for god-mode flag or something

  */
  async adminPasswordChange(req)
  {

    await this._adminCheck(req.user);

    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;
    const username = req.body.username;

    if (!oldPassword) {
      await this._users.setPassword(username, newPassword);
      return { ok: true };
    }

    const success = await this._users.checkPassword(username, oldPassword);
    if (!success) {
      throw new Error('Incorrect old password');
    }

    await this._users.setPassword(username, newPassword);
    return { ok: true };

  }

};
