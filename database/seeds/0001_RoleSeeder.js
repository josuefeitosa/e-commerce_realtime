'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */

const Role = use('Role');

class RoleSeeder {
  async run () {
    
    //Role ADMIN
    await Role.create({
      name: 'Admin',
      slug: 'admin',
      description: 'Administrador do sistema.'
    })

    //Role GEREMTE
    await Role.create({
      name: 'Manager',
      slug: 'manager',
      description: 'Gerente da loja.'
    })

    //Role CLIENTE
    await Role.create({
      name: 'Client',
      slug: 'client',
      description: 'Cliente da loja.'
    })
  }
}

module.exports = RoleSeeder
