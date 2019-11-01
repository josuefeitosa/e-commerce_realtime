'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User');
const Transformer = use('App/Transformers/Admin/UserTransformer');
/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination, transform }) {
    const name = request.input('name');
    const query = User.query();

    if (name){
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    };

    var users = await query.paginate(pagination.page, pagination.limit);

    users = await transform.paginate(users, Transformer);
    return response.send(users);
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      const user_data = request.only(['name', 'surname', 'email', 'password', 'image_id']);
      var user = await User.create(user_data);

      user = await transform.item(user, Transformer);
      return response.status(201).send({created_user: user});
    } catch (error) {
      return response.send({message: 'Não foi possível criar este usuário no momento.'})      
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response, transform}) {
    var user = await User.findOrFail(params.id);

    user = await transform.item(user, Transformer);
    return response.send(user);
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {
    var user = await User.findOrFail(params.id);
    const user_data = request.only(['name', 'surname', 'email', 'password', 'image_id']);

    await user.merge(user_data);
    await user.save();

    user = await transform.item(user, Transformer);
    return response.send({updated_data: user});
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const user = await User.findOrFail(params.id);

    try {
      await user.delete();
      return response.send({deleted_data: user});
    } catch (error) {
      return response.send({message: 'Não foi possível deletar esse usuário.'})
    } 
  }
}

module.exports = UserController
