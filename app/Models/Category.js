'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {

    images () {
        return this.belongsTo('App/Models/Image');
    }

    products () {
        return this.belongsToMany('App/Models/Product');
    }
}

module.exports = Category
