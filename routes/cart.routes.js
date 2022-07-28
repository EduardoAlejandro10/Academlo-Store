const express = require('express')




// Controllers
 const { 
    addProductToUserCart,
    updateProductInCart,
    deleteProductFromCart,
    purchaseCart
 } = require('../controllers/cart.controller')

// Middlewares
  const {protectSession} = require('../middlewares/auth.middleware')
const { productExists } = require('../middlewares/products.middleware')





const cartRouter = express.Router()


// Routes

cartRouter.post('/add-product', protectSession, productExists, addProductToUserCart)
cartRouter.patch('/update-cart', protectSession, productExists, updateProductInCart)
cartRouter.delete('/:productId', protectSession,  deleteProductFromCart )
cartRouter.post('/purchase', protectSession, purchaseCart)



module.exports = {cartRouter};