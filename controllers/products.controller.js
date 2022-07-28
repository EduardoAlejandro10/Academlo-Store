
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');


// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");

// Models
const { Product } = require("../models/product.model");
const { Category } = require("../models/category.model");
const { ProductImg } = require('../models/productImg.model');
const { storage } = require('../utils/firebase.util');

const createProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { title, description, price, categoryId, quantity } = req.body;

  const newProduct = await Product.create({
    title,
    description,
    price,
    categoryId,
    quantity,
    userId: sessionUser.id,
  });

   

  if (req.files.length > 0) {
    
    const filesPromises = req.files.map(async file => {
      const imgRef = ref(storage, `products/${Date.now()}_${file.originalname}`);
      const imgRes = await uploadBytes(imgRef, file.buffer);

      return await ProductImg.create({
        productId: newProduct.id,
        imgUrl: imgRes.metadata.fullPath,
      });
    
    });

    await Promise.all(filesPromises);
    console.log(req.files);
  }


  res.status(201).json({
    status: "success",
    newProduct,
  });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({ where: { status: "active" } });

  res.status(200).json({
    status: "success",
    products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req;


  res.status(200).json({
    status: "success",
    product,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  const { title, description, price, quantity } = req.body;

  await product.update({
    title,
    description,
    price,
    quantity,
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({
    status: "deleted",
  });

  res.status(200).json({
    status: "success",
    product,
  });
});

const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: "active" } });

  res.status(200).json({
    status: "success",
    categories,
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
  });

  res.status(201).json({
    status: "success",
    newCategory,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { category } = req;

  const { name } = req.body;

  await category.update({
    name,
  });

  res.status(200).json({
    status: "success",
    category,
  });
});

module.exports = {
  updateCategory,
  createCategory,
  getAllCategories,
  deleteProduct,
  updateProduct,
  getProductById,
  getAllProducts,
  createProduct,
};
