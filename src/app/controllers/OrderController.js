const LoadProductService = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const User = require('../models/User');
const Order = require('../models/Order');


const mailer = require('../../lib/mailer');
const Cart = require('../../lib/cart');
const { formatPrice, date } = require('../../lib/utils');
const { update } = require('../models/Order');



const email = (seller, product, buyer) => `
    <h2>Olá ${seller.name}</h2>
    <p>Você tem um novo pedido de compra do seu produto</p>
    <p>Produto: ${product.name}</p>
    <p>Preço: ${product.formattedPrice}</p>
    <p><br/><br/></p>
    <h3>Dados do comprador</h3>
    <p>Nome: ${buyer.name}</p>
    <p>Email: ${buyer.email}</p>
    <p>Endereço: ${buyer.address}</p>
    <p>CEP: ${buyer.cep}</p>
    <p><br/><br/></p>
    <p><strong>Entre em contato com o comprador para finalizar a venda!</strong></p>
    <p><br/><br/></p>
    <p>Atenciosamente, Equipe Launchstore</p>
`

module.exports = {
    async index(req, res) {
        // PEGAR OS PEDIDOS DO USER
        const orders = await LoadOrderService.load('orders', { where: { buyer_id: req.session.userId }});

        return res.render("orders/index", { orders })
    },

    async sales(req, res) {
        // PEGAR OS PEDIDOS DO USER
        const sales = await LoadOrderService.load('orders', { where: { seller_id: req.session.userId }});

        return res.render("orders/sales", { sales })
    },

    async show(req, res) {
        const sale = await LoadOrderService.load('order', { where: { id: req.params.id }});

        return res.render("orders/details", { sale });
    },

    async update(req, res) {
        try {
            const { id, action } = req.params;
            const acceptedActions = ['close', 'cancel'];

            if(!acceptedActions.includes(action)) return res.send("Não posso fazer tal ação")

            // PEGAR O PEDIDO
            const order = await Order.findOne({ where: { id }});

            if(!order) return res.send('Order not found')

            // VERIFICAR SE ELE ESTÁ ABERTO
            if(order.status != 'open') return res.send("Não posso fazer tal ação")

            // ATUALIZAR O PEDIDO
            const statuses = {
                close: "sold",
                cancel: "canceled"
            }

            order.status = statuses[action];

            await Order.update(id, {
                status: order.status
            })

            // REDIRECIONAR
            return res.redirect("/orders/sales")

        } catch (error) {
            console.error(error);
        }
    },

    async post(req, res) {
        try {
            // PEGAR OS PRODUTOS DO CARRINHO
            const cart = Cart.init(req.session.cart)

            const buyer_id = req.session.userId
            const filteredItems = cart.items.filter(item => item.product.user_id != buyer_id);

            // CRIAR O PEDIDO
            const createOrdersPromise = filteredItems.map(async item => {
                let { product, price: total, quantity } = item
                const { price, id: product_id, user_id: seller_id } = product
                const status = "open"

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    total,
                    quantity,
                    status
                })

                // PEGAR OS DADOS DO PRODUTO
                product = await LoadProductService.load('product', { where: { id: product_id } });
                

                // PEGAR OS DADOS DO VENDEDOR
                const seller = await User.findOne( { where: { id: seller_id}});

                // PEGAR OS DADOS DO COMPRADOR
                const buyer = await User.findOne( { where: { id: buyer_id }});

                // ENVIAR EMAIL COM DADOS DA COMPRA PARA O VENDEDOR
                await mailer.sendMail({
                    to: seller.email,
                    from: 'no-reply@launchstore.com.br',
                    subject: 'Novo pedido de compra',
                    html: email(seller, product, buyer)
                })

                return order
            })

            await Promise.all(createOrdersPromise);

            // LIMPAR CARRINHO
            delete req.session.cart;
            Cart.init();

            // NOTIFICAR O USUÁRIO COM ALGUMA MENSAGEM DE SUCESSO 
            return res.render('orders/success');

        } catch (err) {
            console.error(err);
            return res.render('orders/error');
        }
    }
}