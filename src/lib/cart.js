const { formatPrice } = require('./utils');


// CARRINHO FICA GUARDADO NA SESSÃO (REQ,SESSION)
const Cart = {
    init(oldCart) {
        if(oldCart){
            this.items = oldCart.items;
            this.total = oldCart.total;
        } else {
            this.items = [];
            this.total = {
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            };
        };

        return this;
    },

    // ADICIONAR 1 ITEM AO CARRINHO 
    addOne(product) {
        // VER SE O PRODUTO JÁ EXISTE NO CARRINHO 
        let inCart = this.getCartItem(product.id);


        // SE NÃO EXISTE
        if(!inCart) {
            inCart = {
                product: {
                    ...product,
                    formattedPrice: formatPrice(product.price)
                },
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            };

            this.items.push(inCart);
        };

        // MAXIMA QUANTIDADE
        if(inCart.quantity >= product.quantity) return this;

        // UPDATE ITEM
        inCart.quantity++;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        // UPDATE CART
        this.total.quantity++;
        this.total.price += inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);

        return this;
    },

    // REMOVER 1 ITEM DO CARRINHO
    removeOne(productId) {
        // PEGAR O ITEM DO CARRINHO
        const inCart = this.getCartItem(productId);


        if(!inCart) return this;

        // ATUALIZAR ITEM
        inCart.quantity--;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        // ATUALIZAR O CARRINHO 
        this.total.quantity--;
        this.total.price -= inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);

        // CHEGAR A 0 REMOVER DO CARRINHO
        if(inCart.quantity < 1) {
            this.items = this.items.filter( item => item.product.id != inCart.product.id );
            return this;
        }

        return this;
    },

    // DELETAR TODO O ITEM 
    delete(productId) {
        const inCart = this.getCartItem(productId);

        if(!inCart) return this;

        if(this.items.length > 0) {
            this.total.quantity -= inCart.quantity;
            this.total.price -= (inCart.product.price * inCart.quantity);
            this.total.formattedPrice = formatPrice(this.total.price);
        };

        this.items = this.items.filter( item => inCart.product.id != item.product.id );

        return this;
    },

    getCartItem(productId) {
        return this.items.find( item => item.product.id == productId );  
    }
};


module.exports = Cart;