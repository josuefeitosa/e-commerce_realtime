'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductSchema extends Schema {
  up () {
    this.create('products', (table) => {
      table.increments();
      table.string('name', 200);
      table.integer('image_id').unsigned();
      table.text('description');
      table.decimal('price', 12, 2);
      table.timestamps();
    })

    //Tabela pivô do relacionamento N-N entre Produtos e Imagens (cada produto terá uma galeria de imagens)
    this.create('image_product', (table) => {
      table.increments();
      table.integer('image_id').unsigned().references('id').inTable('images').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.timestamps();
    })

    this.create('category_product', (table) => {
      table.increments();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE');
      table.timestamps();
    })
  }

  down () {
    this.drop('category_product');
    this.drop('image_product');
    this.drop('products');
  }
}

module.exports = ProductSchema
