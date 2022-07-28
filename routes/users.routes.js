const express = require('express')



// Controllers 

const {
  createUser,
  login,
  updateUser,
  deleteUser,
  getUserOrders,
  getOrderById,
  getProductsCreatedByTheUser
} = require('../controllers/users.controller');



// Middlewares

const {createUserValidators} = require('../middlewares/validators.middleware')
const {protectSession} = require('../middlewares/auth.middleware')
const {protectUserAccount} = require('../middlewares/auth.middleware')
const { userExists } = require('../middlewares/users.middleware')
const {orderExists} = require('../middlewares/orders.middleware')



const usersRouter = express.Router()


// Routes

usersRouter.post('/', createUserValidators, createUser)
usersRouter.post('/login', login)
usersRouter.get('/me', protectSession, getProductsCreatedByTheUser)
usersRouter.patch('/:id', protectSession, userExists, protectUserAccount, updateUser)
usersRouter.delete('/:id', protectSession, userExists, protectUserAccount, deleteUser)
usersRouter.get('/orders', protectSession, getUserOrders)
usersRouter.get('/orders/:id', protectSession, orderExists, getOrderById)



module.exports = { usersRouter };

