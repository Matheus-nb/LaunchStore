const { addOne, removeOne } = require('../../lib/cart');
const Cart = require('../../lib/cart');

const LoadProductService = require('../services/LoadProductService');


module.exports = {
    async index(req, res) {
        try {

            let { cart } = req.session;

            // GERENCIADOR DE CARRINHO
            cart = Cart.init(cart)

            return res.render("cart/index", { cart });
            
        } catch (err) {
            console.error(err);
        }
    },

    async addOne(req, res) {
        // PEGAR O ID DO PRODUTO E O PRODUTO
        const { id } = req.params;
        const product = await LoadProductService.load('product', { where: { id }});

        // PEGAR O CARRINHO DA SESSÃO
        let { cart } = req.session;

        // ADICIONAR O PRODUTO AO CARRINHO ( USANDO GERENCIADOR DO CARRINHO )
        cart = Cart.init(cart).addOne(product);

        // ATUALIZAR O CARRINHO DA SESSÃO
        req.session.cart = cart;

        // REDIRECIONAR O USER PRA TELA DO PRODUTO
        return res.redirect('/cart');
    },

    removeOne(req, res) {
        // PEGAR O CARRINHO DA SESSÃO E ID DO PRODUTO
        const { id } = req.params;
        let { cart } = req.session;
        
        // SE N TIVER CARRINHO RETORNAR
        if(!cart) return res.redirect('/cart');

        // INICIAR O CARRINHO ( GERENCIADOR DE CARRINHO) E REEMOVER
        cart = Cart.init(cart).removeOne(id);

        // ATUALIZAR O CARRINHO DA SESSAO, REMOVENDO 1 ITEM
        req.session.cart = cart;

        // REDIRECIONAMENTO PARA A PAGINA CART
        return res.redirect('/cart');

    },

    delete(req, res) {
        let { id } = req.params;
        let { cart } = req.session;

        if(!cart) return;

        req.session.cart = Cart.init(cart).delete(id);

        return res.redirect('/cart');
    }
};