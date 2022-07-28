// Models
const { Order } = require('../models/order.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');
const {ProductInCart} = require('../models/productsInCart.model');
const { Cart } = require('../models/cart.model');

const orderExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const order = await Order.findOne({ where: {id:  id, }, include: [{model: Cart}]});

	if (!order) {
		return next(new AppError('order not found', 404));
	}

	req.order = order;
	next();
});

module.exports = { orderExists };
