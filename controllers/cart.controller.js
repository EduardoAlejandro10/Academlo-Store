// Models
const { ProductInCart } = require("../models/productsInCart.model");
const { Product } = require("../models/product.model");
const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");

// Utils

const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { Email } = require("../utils/email.util");

const addProductToUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser, product } = req;

  const { productId, quantity } = req.body;

  if (quantity > product.quantity) {
    return next(
      new AppError(
        `There are only ${product.quantity} ${product.title} in stock`,
        400
      )
    );
  }

  // validate if the user has a cart
  const cart = await Cart.findOne({
    where: { status: "active", userId: sessionUser.id },
  });

  if (!cart) {
    const newCart = await Cart.create({ userId: sessionUser.id });

    await ProductInCart.create({
      productId,
      quantity,
      cartId: newCart.id,
    });
  }
  // validate if the product is already in the cart
  const productInCartExists = await ProductInCart.findOne({

    where: {
      productId,
    },
  });

  if (productInCartExists && productInCartExists.status !== "active") {
    await productInCartExists.update({
      quantity,
      status: "active",
    });
  }

  if (!productInCartExists) {
    await ProductInCart.create({
      productId,
      quantity,
      cartId: cart.id,
    });
  }

  res.status(201).json({
    status: "success",
    cart,
  });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;

  const { productId, newQuantity } = req.body;

  if (newQuantity > product.quantity) {
    return next(
      new AppError(
        `There are only ${product.quantity} ${product.title} in stock`,
        400
      )
    );
  }

  if (newQuantity === 0) {
    productId.update({
      status: "removed",
    });
  }

  const productInCart = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  const existWithRemovedStatus = await ProductInCart.findOne({
    where: {
      productId,
    },
  });

  if (existWithRemovedStatus.status === "removed") {
    await existWithRemovedStatus.update({
      status: "active",
      newQuantity,
    });
  }

  await productInCart.update({
    productId,
    newQuantity,
  });

  res.status(200).json({
    status: "success",
  });
});

const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const deletedProduct = await ProductInCart.findOne({ where: { productId } });

  await deletedProduct.update({
    status: "removed",
  });

  res.status(200).json({ status: "success", deletedProduct });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { productId } = req;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { 
      userId: sessionUser.id,
      status: "active",
    },
    include: [{ 
      model: ProductInCart,
      include: Product
    }],
  });
    
  console.log(cart.productInCarts);

  const updateStock = cart.productInCarts.map(async (product) => { 
    const productToUpdate = await Product.findOne({
      where: { id: product.productId },
      status: "active",
    });
    const subtraction = productToUpdate.quantity - product.quantity;
    await productToUpdate.update({
      quantity: subtraction,
    });
  });

  let totalPrice = 0;

  cart.productInCarts.map((product) => {
    totalPrice = product.quantity * product.product.price;
  });

  cart.update({
    status: "purchased",
  });

  cart.productInCarts.map((product) => {
    product.update({
      status: "purchased",
    });
  });

  const newOrder = await Order.create({
    userId: sessionUser.id,
    totalPrice,
    cartId: cart.id,
  });

  await new Email(sessionUser.email).sendNewOrder(
    cart.productInCarts,
   sessionUser.username,
    totalPrice,

  );

  res.status(200).json({
    status: "success",
    totalPrice,
    newOrder,
    cart,
    message: `Your order has been placed and this is your total price: ${totalPrice}`,
  });
});
module.exports = {
  addProductToUserCart,
  updateProductInCart,
  deleteProductFromCart,
  purchaseCart,
};
