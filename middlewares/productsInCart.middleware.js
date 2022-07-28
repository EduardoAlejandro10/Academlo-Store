// Models
const { ProductInCart } = require('../models/productsInCart.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const productInCartExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	
	

	const productInCart = await ProductInCart.findOne({ where: {  id  } });

	if (!productInCart) {
		return next(new AppError('Product not found', 404));
	}

	req.productInCart = productInCart;
	next();
});

module.exports = { productInCartExists };
