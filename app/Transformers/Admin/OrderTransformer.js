'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')
const OrderItemTransformer = use('App/Transformers/Admin/OrderItemTransformer')
const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  availableInclude() {
    return ['user', 'coupons', 'items', 'discounts']
  }

  /**
   * This method is used to transform the data.
   */
  transform(model) {
    model = model.toJSON()
    return {
      id: model.id,
      date: model.created_at,
      status: model.status,
      total: model.total ? parseFloat(model.total.toFixed(2)) : 0,
      qty_items:
        model.__meta__ && model.__meta__.qty_items
          ? model.__meta__.qty_items
          : 0,
      discount:
        model.__meta__ && model.__meta__.discount ? model.__meta__.discount : 0, //__meta__ acessa o $sideLoaded
      subtotal:
        model.__meta__ && model.__meta__.subtotal ? model.__meta__.subtotal : 0
    }
  }

  includeUser(model) {
    return this.item(model.getRelated('users'), UserTransformer);
  }

  includeItems(model){
    return this.item(model.getRelated('items'), OrderItemTransformer);
  }

  includeCoupons(model){
    return this.item(model.getRelated('coupons'), CouponTransformer);
  }

  includeDiscounts(model){
    return this.item(model.getRelated('discounts'), DiscountTransformer);
  }
}

module.exports = OrderTransformer