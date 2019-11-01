'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category');
const Transformer = use('App/Transformers/Admin/CategoryTransformer');

/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {Object} ctx.pagination //objeto criado para paginação através do middleware Pagination
   */
  async index ({ request, response, pagination, transform }) {
    const title = request.input('title');

    const query = Category.query();

    if (title) //adiciona a cláusula WHERE caso tenha um parâmetro 'title' passado no request
      query.where('title', 'LIKE', `%${title}%`);

    var categories = await query.paginate(
      pagination.page, 
      pagination.limit);

    categories = await transform.paginate(categories, Transformer);

    return response.send(categories);
  }

  /**
   * Render a form to be used for creating a new category.
   * GET categories/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  
  async store ({ request, response, transform }) {
    try {
      const {title, description, image_id} = request.all();
      var category = await Category.create({title, description, image_id});

      category = await transform.item(category, Transformer);
      return response.status(201).send({included_data: category});

    } catch (error) {
      return response.status(400).send({message: 'Erro ao processar a sua solicitação!'});
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, transform }) {
    var category = await Category.findOrFail(params.id);

    category = transform.item(category, Transformer);
    return response.send(category);
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {
    var category = await Category.findOrFail(params.id);

    const { title, description, image_id } = request.all();

    await category.merge({title, description, image_id});
    await category.save();

    category = await transform.item(category, Transformer);
    return response.send({updated_data: category});
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    var category = await Category.findOrFail(params.id);

    await category.delete();

    category = transform.item(category, Transformer);
    return response.send({destroyed_category: category});
  }
}

module.exports = CategoryController
