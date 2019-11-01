'use strict'

const OrderHook = exports = module.exports = {}

OrderHook.updateValues = async (modelInstance) => {
                                             //modelInstance.metodoNoModel.funçãoAggr('campo no model referencia')
    modelInstance.$sideLoaded.subtotal = await modelInstance.items().getSum('subtotal');
    modelInstance.$sideLoaded.qty_items = await modelInstance.items().getSum('quantity');
    modelInstance.$sideLoaded.discount = await modelInstance.discounts().getSum('discount');

    modelInstance.total = (modelInstance.$sideLoaded.subtotal - modelInstance.$sideLoaded.discount);
}

OrderHook.updateCollectionValues = async (modelsInstance) => {
    for (let model of modelsInstance) {
        model = await OrderHook.updateValues(model);
    }
}
