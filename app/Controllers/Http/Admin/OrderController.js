'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Database = use('Database');
const OrderService = use('App/Services/Order/OderService');
const Coupon = use('App/Models/Coupon');
const Discount = use('App/Models/Discount')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const query = Order.query();
    const { id, status } = request.only(['id', 'status']);

    if (id && status){
      query.where('status', status);
      query.orWhere('id', 'LIKE', `%${id}%`);
    } else if (id && !status) {
      query.where('id', 'LIKE', `%${id}%`);
    } else if (!id && status) {
      query.where('status', status);
    }

    const orders = query.paginate(pagination.page, pagination.limit);

    return response.send(orders);

  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const transaction = await Database.beginTransaction();
    try {
      const {user_id, items, status} = request.all();
      let order = await Order.create({user_id, status}, transaction);

      const service = new OrderService(order, transaction);

      if (items && items.length > 0) {
        await service.syncItems(items, transaction);
      }

      await transaction.commit();
      return response.status(201).send(order);

    } catch (error) {
      await transaction.rollback();
      return response.status(400).send({message: 'Não foi possível criar o pedido no momento.'})  
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response}) {
    const order = await Order.findOrFail(params.id);

    return response.send(order);
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const order = await Order.findOrFail(params.id);
    const transaction = await Database.beginTransaction();
    const service = new OrderService(order, transaction);

    try {
      const { user_id, items, status } = request.all();

      await order.merge({user_id, status});
      await service.updateItems(order);

      await order.save(transaction);

      await transaction.commit();

      return response.send({updated_data: order});

    } catch (error) {
      await transaction.rollback();

      return response.status(400).send({message: 'Não foi possível atualizar este pedido no momento.'})
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    const order = await Order.findOrFail(params.id);
    const transaction = await Database.beginTransaction();

    try {
      await order.items().delete(transaction); //deleta os registros na tabela OrderItem;
      await order.coupons().delete(transaction);
      await order.delete(transaction);

      await transaction.commit();

      return response.send({deleted_data: order});
    } catch (error) {
      await transaction.rollback();
      return response.status(400).send({message: 'Não foi possível excluir no momento.'})
      
    }
  }

  async applyDiscount({ params, request, response}){
    const { code } = request.all();

    const coupon = await Coupon.findByOrFail('code', code.toUpperCase());
    const order = await Order.findOrFail(params.id);

    var discount, info = {};

    try {
      const service = new OrderService(order);
      const canAddDiscount = await service.canApplyDiscount(coupon);
      const orderDiscounts = await order.coupons().getCount();

      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive);

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({ //aqui o Hook de Discount será acionado
          order_id: order.id, 
          coupon_id: coupon.id
        });
        info.message = 'Cupom aplicado com sucesso!';
        info.success = true;
      } else {
        info.message = 'Não foi possível aplicar este cupom!';
        info.success = false;
      }

      return response.send({order, info});
    } catch (error) {
      return response.status(400).send({message: 'Erro ao aplicar o cupom.'});
    }
  }

  async removeDiscount({request, response}) {
    const {discount_id } = request.all();
    const discount = await Discount.findOrFail(discount_id);

    await discount.delete();
    return reseponse.status(204).send();
  }
}

module.exports = OrderController
