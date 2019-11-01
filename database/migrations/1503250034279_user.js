'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments();
      table.string('name', 80);
      table.string('surname', 200);
      table.string('email', 254).notNullable().unique();
      table.string('password', 60).notNullable();
      table.integer('image_id').unsigned(); //o relacionamento com a tabela Images será feito em uma migration posterior (1572289135240_user_image_fk_schema)
      table.timestamps();
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
