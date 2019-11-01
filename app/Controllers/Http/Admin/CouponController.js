'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon');
const Database = use('Database');
const CouponService = use('App/Services/Coupon/CouponService');
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
        
    const code = request.input('code');
    const query = Coupon.query();

    if (code)
      query.where('code', 'LIKE', `%${code}%`);
    
    const coupon = await query.paginate(pagination.page, pagination.limit);

    return response.send(coupon);

  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const transaction = await Database.beginTransaction();
    /**
    * 1 - produto - pode ser utilizado em apenas produtos específicos;
    * 2 - clientes - pode ser utilizado por apenas clientes específicos;
    * 3 - clientes e produtos - pode ser utilizado somente em produtos e clientes específicos;
    * 4 - pode ser utilizado por qualquer cliente em qualquer pedido;
    */
    var can_use_for = {
      product: false,
      customer: false
    };

    try {
      const coupon_data = request.only(['code', 'discount', 'valid_from', 'valid_until', 'quantity', 'type', 'recursive']);
      const { users, products } = request.only(['users', 'products']);

      const coupon = await Coupon.create(coupon_data, transaction);

      const service = new CouponService(coupon, transaction);
      
      if (products && products.length > 0){
        can_use_for.product = true;
        service.syncProducts(products);
      }
      
      if (users && users.length > 0){
        can_use_for.customer = true;
        service.syncUsers(users);
      }

      if (can_use_for.product && can_use_for.customer) {
        coupon.can_use_for = 'product_client';
      } else if (can_use_for.product && !can_use_for.customer) {
        coupon.can_use_for = 'product';
      } else if (!can_use_for.product && can_use_for.customer) {
        coupon.can_use_for = 'customer';
      } else {
        coupon.can_use_for = 'all';
      }

      await coupon.save(transaction);
      await transaction.commit();

      return response.status(201).send(coupon);
      
    } catch (error) {
      await transaction.rollback();
      return response.status(400).send({message: 'Não foi possível incluir o cupom no momento.'})
    }


  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response }) {
    const coupon = await Coupon.findOrFail(params.id);

    return response.send(coupon);
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, response }) {
    const transaction = await Database.beginTransaction();

    const coupon = await Coupon.findOrFail(params.id);

    var can_use_for = {
      product: false,
      customer: false
    };

    try {
      const coupon_data = request.only(['code', 'discount', 'valid_from', 'valid_until', 'quantity', 'type', 'recursive']);
      
      await coupon.merge(coupon_data);

      const { users, products } = request.only(['users', 'products']);

      const service = new CouponService(coupon, transaction);

      if (users && users.length > 0) {
        await service.syncUsers(users);
        can_use_for.customer = true;
      }

      if (products && products.length > 0) {
        await service.syncProducts(products);
        can_use_for.product = true;
      }

      if (can_use_for.product && can_use_for.customer) {
        coupon.can_use_for = 'product_client';
      } else if (can_use_for.product && !can_use_for.customer) {
        coupon.can_use_for = 'product';
      } else if (!can_use_for.product && can_use_for.customer) {
        coupon.can_use_for = 'customer';
      } else {
        coupon.can_use_for = 'all';
      }

      await coupon.save(transaction);
      await transaction.commit();

      return response.status(200).send(coupon);

    } catch (error) {
      await transaction.rollback();
      return response.status(400).send({message: 'Não foi possível atualizar o cupom no momento.'});
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    const transaction = await Database.beginTransaction();
    const coupon = await Coupon.findOrFail(params.id);

    try {
      //Deletar todos os relacionamentos antes de deletar o cupom
      await coupon.products().detach([], transaction);
      await coupon.orders().detach([], transaction);
      await coupon.users().detach([], transaction);

      await coupon.delete(transaction);
      
      await transaction.commit();

      return response.send({deleted_data: coupon});

    } catch (error) {

      await transaction.rollback();
      return response.status(400).send({message: 'Não foi possível fazer esta operação no momento'});      
    }
  }
}

module.exports = CouponController
