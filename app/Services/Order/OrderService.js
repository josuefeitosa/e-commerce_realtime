'use strict'

const Database = use('Database');

class OrderService {
    constructor(model, transaction){
        this.model = model;
        this.transaction = transaction;
    }

    async syncItems(items){
        if (!Array.isArray(items))
            return false;

        await this.model.items().delete(this.transaction);
        await this.model.items().createMany(items, this.transaction)
    }

    async updateItems(items){
        let currentItems = await this.model.items().whereIn('id', items.map(item => {
            item.id;
        }).fetch(this.transaction));

        await this.model.items().whereNotIn('id', items.map(item => {
            item.id;
        }).delete(this.transaction));

        await Promise.all(currentItems.rows.map(async item => {
            item.fill(items.find(x => x.id === item.id));

            await item.save(this.transaction);
        }))
    }

    async canApplyDiscount(coupon){

        const now = new Date().getTime();
        if (now > coupon.valid_from.getTime() ||
           (typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)) { 

            const couponProducts = await Database
                                            .from('coupon_products')
                                            .where('coupon_id', coupon.id)
                                            .pluck('product_id'); //(product_id => 1, product_id => 2) ~> [1, 2]

            const couponCustomers = await Database
                                            .from('coupon_user')
                                            .where('coupon_id', coupon.id)
                                            .pluck('user_id');

            if (Array.isArray(couponProducts) && couponProducts.length < 1
            && Array.isArray(couponCustomers) && couponCustomers.length < 1) {
                /**
                * Caso não esteja associado à cliente ou produto específico, é de uso livre
                */
                return true;
            }

            let isAssociatedToProducts, isAssociatedToCustomers = false;

            if (Array.isArray(couponProducts) && couponProducts.length > 0) { 
                isAssociatedToProducts = true
            };

            if (Array.isArray(couponCustomers) && couponCustomers.length > 0) { 
                isAssociatedToCustomers = true
            };

            const productsMatch = await Database
                                            .from('order_items')
                                            .where('order_id', this.model.id)
                                            .whereIn('product_id', couponProducts)
                                            .pluck('product_id');
            
            /**
            * Caso de uso 1 => Cupom está associado à clientes & produtos;
            */
            if (isAssociatedToCustomers && isAssociatedToProducts) {
                const customerMatch = couponCustomers.find(customer => customer);
                if (customerMatch && Array.isArray(productsMatch) && productsMatch.length > 0)
                return true;
            }

            /**
            * Caso de uso 2 => Cupom está associado apenas ao produto;
            */
            if (isAssociatedToProducts && Array.isArray(productsMatch) && productsMatch.length > 0)
                return true;
            
            /**
            * Caso de uso 3 => Cupom está associado apenas a clientes;
            */
            if (isAssociatedToCustomers && Array.isArray(couponCustomers) && couponCustomers.length > 0){
                const match = couponCustomers.find(customer => this.model.user_id);
                if (match)
                    return true;
            }

            /**
            * Caso de uso 4 => Nenhuma das verificações acima deem positivas, então o cupom está associado
            * à clientes ou produtos ou os dois, porém nenhum dos produtos deste pedido está elegível ao desconto e
            * o cliente que fez a compra também não poderá utilizar este cupom;
            */
            return false;
        } else {
            return false;
        }       
    }
}

module.exports = OrderService;