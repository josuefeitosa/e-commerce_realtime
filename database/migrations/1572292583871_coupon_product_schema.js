'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CouponProductSchema extends Schema {
  up () {
    this.create('coupon_product', (table) => {
      table.increments();
      table.integer('coupon_id').unsigned().references('id').inTable('coupons').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.timestamps();
    })
  }

  down () {
    this.drop('coupon_product')
  }
}

module.exports = CouponProductSchema
