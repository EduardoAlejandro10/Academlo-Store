const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { Email } = require("../utils/email.util");

// Models
const { Product } = require("../models/product.model");
const { User } = require("../models/user.model");
const { Order } = require("../models/order.model");
const { ProductInCart } = require("../models/productsInCart.model");

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
  });

  newUser.password = undefined;

  await new Email(email).sendWelcome(username);

  res.status(201).json({
    status: "success",
    newUser,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate credentials (email)
  const user = await User.findOne({
    where: {
      email,
      status: "active",
    },
  });

  if (!user) {
    return next(new AppError("Credentials invalid", 400));
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError("Credentials invalid", 400));
  }

  // Generate JWT (JsonWebToken) ->
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Send response
  res.status(200).json({
    status: "success",
    token,
  });
});

const getProductsCreatedByTheUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const products = await Product.findAll({ where: { userId: sessionUser.id } });

  res.status(200).json({
    status: "success",
    products,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { username, email } = req.body;

  await user.update({
    username,
    email,
  });

  res.status(200).json({ status: "success" });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: "deleted" });

  res.status(200).json({ status: "success" });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: { userId: sessionUser.id },
    status: "purchased",
  });

  res.status(200).json({
    status: "success",
    orders,
  });
});

const getOrderById = catchAsync(async (req, res, next) => {
  const { order } = req;

  res.status(200).json({
    status: "success",
    order,
  });
});

module.exports = {
  createUser,
  login,
  getProductsCreatedByTheUser,
  updateUser,
  deleteUser,
  getUserOrders,
  getOrderById,
};
