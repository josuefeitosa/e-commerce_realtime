'use strict'

const { hooks } = require('@adonisjs/ignitor');

hooks.after.providersBooted(() => {
    const Validator = use('Validator');
    const Database = use('Database');

    const existsFn = async (data, field, message, args, get) => {
        const value = get(data, field);
        if (!value) {
            return
        }

        const [table, column] = args;
        const row = await Database
                                .from(table)
                                .where(column, value)
                                .first()

        if (!row)
            throw message;
    }

    Validator.extend('exists', existsFn);
})
