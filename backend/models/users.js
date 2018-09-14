const bcrypt = require('bcrypt');
const SALT_ROUNDS = 11;

/*

  Users db api

*/
module.exports = class UsersApi {

  constructor(knex)
  {
    this._knex = knex;
  }

  /*

    Create a new user

  */
  async create(data = {})
  {

    return await this._knex
      .insert(data)
      .into('users')
      .returning(['id', 'username', 'first_name', 'last_name']);

  }

  /*

    get all users in db

  */
  async getAll()
  {
    const rows = await this._q();
    return rows.map(r => this._clean(r));
  }

  /*

    get a user by id

  */
  async getById(id)
  {
    if (!id) {
      throw new Error('Missing id param');
    }

    const [ res ] = await this._knex.table('users as u')
      .leftJoin('user_flags as uf', 'u.id', 'uf.user_id')
      .leftJoin('flags as f', 'uf.flag_id', 'f.id')
      .where('u.id', id)
      .groupBy('u.id')
      .select([
        'u.*',
        this._knex.raw(`COALESCE(
          json_agg(f.name) FILTER (WHERE f.name IS NOT NULL), '[]'
        ) AS flags`)
      ]);

    return this._clean(res);
  }

  async getByUsername(username)
  {
    const [ user ] = await this._q({
      username
    });

    return this._clean(user);
  }

  /*

    run a basic users query

  */
  async _q(w = {})
  {
    return await this._knex
      .select('*')
      .from('users as u')
      .where(w);
  }

  /*

    strip down responses to relevant properties

  */
  _clean(model)
  {
    return {
      id: model.id,
      first_name: model.first_name,
      last_name: model.last_name,
      username: model.username,
      email: model.email,
      host_id: model.host_id,
      flags: model.flags || [ ]
    };
  }

  async checkPassword(username, pw)
  {
    let user = await this._q({ username });

    if (!user) {
      throw new Error(`user not found by username ${username}`);
    }

    if (user.length) {
      user = user[0];
    }

    return bcrypt.compareSync(pw, user.password);
  }

  async setPassword(username, pw)
  {
    const password = bcrypt.hashSync(pw, bcrypt.genSaltSync(SALT_ROUNDS));
    return await this._knex
      .from('users')
      .where({ username })
      .update({ password });
  }

};
