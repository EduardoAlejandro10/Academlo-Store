const express = require('express')


// Controllers

const {
  createCategory,
  createProduct,
  deleteProduct,
  getAllCategories,
  getAllProducts,
  getProductById,
  updateCategory,
  updateProduct
} = require('../controllers/products.controller')

// Utils
const {upload} = require('../utils/upload.util')
// Middlewares
const { protectUserAccount, protectSession} = require('../middlewares/auth.middleware')
const { productExists } = require('../middlewares/products.middleware')
const {categoryExists} = require('../middlewares/categories.middleware')
const { createProductsValidators } = require('../middlewares/validators.middleware')




const productsRouter = express.Router()



// Routes

productsRouter.post('/', protectSession, upload.array('productImg', 5),  createProductsValidators, createProduct)
productsRouter.get('/', getAllProducts)
productsRouter.get('/:id',   productExists, getProductById)
productsRouter.patch('/:id', protectSession,  productExists , updateProduct)
productsRouter.delete('/:id', protectSession,  productExists,   deleteProduct)
productsRouter.get('/categories', getAllCategories)
productsRouter.post('/categories', protectSession, createCategory)
productsRouter.patch('/categories/:id', protectSession, categoryExists, updateCategory)



module.exports = { productsRouter };


