'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CategorySchema extends Schema {
  up () {
    this.create('categories', (table) => {
      table.increments();
      table.string('title', 100).notNullable();
      table.string('description', 255).notNullable();
      table.integer('image_id').unsigned().references('id').inTable('images').onDelete('CASCADE');
      table.timestamps();
    })
  }

  down () {
    this.drop('categories')
  }
}

module.exports = CategorySchema
