'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PasswordResetSchema extends Schema {
  up () {
    this.create('password_resets', (table) => {
      table.increments();
      table.string('email').notNullable().references('email').inTable('users').onDelete('CASCADE');
      table.string('token').notNullable().unique();
      table.datetime('expires_at');
      table.timestamps();
    })
  }

  down () {
    this.drop('password_resets')
  }
}

module.exports = PasswordResetSchema
