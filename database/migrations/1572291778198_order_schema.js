'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments();
      table.decimal('total', 12, 2).defaultTo(0.00);
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.enu('status', ['pending', 'cancelled', 'paid', 'shipped', 'finished']);
      table.timestamps();
    })

    this.create('coupon_order', (table) => {
      table.increments();
      table.integer('coupon_id').unsigned().references('id').inTable('coupons').onDelete('CASCADE');
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
      table.decimal('discount', 12, 2).defaultTo(0.00);
      table.timestamps();
    })
  }

  down () {
    this.drop('coupon_order');
    this.drop('orders');
  }
}

module.exports = OrderSchema
