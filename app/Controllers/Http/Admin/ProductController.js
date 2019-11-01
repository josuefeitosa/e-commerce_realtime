'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const Product = use('App/Models/Product');
const Transformer = use('App/Transformers/Admin/ProductTransformer');
/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination, transform }) {
    const name = request.input('name');
    
    const query = Product.query();

    if (name)
      query.where('name', 'LIKE', `%${name}%`);

    var product = await query.paginate(pagination.page, pagination.limit);

    product = await transform.paginate(product, Transformer);
    return response.send(product);
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {

    try {
      const { name, description, price, image_id } = request.all();

      var product = Product.create({ name, description, price, image_id });

      product = await transform.item(product, Transformer);
      return response.send(product);
    } catch (error) {
      return response.status(400).send({message: "Não foi possível criar o produto neste momento."})
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response, transform}) {
    var product = await Product.findOrFail(params.id);

    product = await transform.item(product, Transformer);
    return response.send(product);
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, transform }) {
    var product = await Product.findOrFail(params.id);

    try {
      const { name, description, price, image_id } = request.all();

      await product.merge({ name, description, price, image_id });
      await product.save();

      product = await transform.item(product, Transformer);
      return response.send({updated_data: product});
    } catch (error) {
      return response.status(400).send({message: "Não foi possível atualizar este produto"})
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response, transform }) {
    var product = await Product.findOrFail(params.id);

    try {
      await product.delete();

      product = await transform.item(product, Transformer);
      return response.send({destroyed_data: product});

    } catch (error) {
      return response.status(500).send({message: "Não foi possível deletar o produto."})
    }
  }
}

module.exports = ProductController
