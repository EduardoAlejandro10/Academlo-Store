const { app } = require("./app");

// Utils
const { db } = require("./utils/database.util");
const { User } = require("./models/user.model");
const { Product } = require("./models/product.model");
const { Order } = require("./models/order.model");
const { ProductInCart } = require("./models/productsInCart.model");
const { Cart } = require("./models/cart.model");
const { Category } = require("./models/category.model");
const { ProductImg } = require("./models/productImg.model");

db.authenticate()
  .then(() => console.log("Db authenticated"))
  .catch((err) => console.log(err));

// Establish model's relations
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(ProductInCart, { foreignKey: "productId" });
ProductInCart.belongsTo(Product, { foreignKey: "productId" });

Cart.hasMany(ProductInCart, { foreignKey: "cartId" });
ProductInCart.belongsTo(Cart, { foreignKey: "cartId" });

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(ProductInCart, { foreignKey: "cartId" });
ProductInCart.belongsTo(Order, { foreignKey: "cartId" });

Cart.hasOne(Order, { foreignKey: "cartId" });
Order.belongsTo(Cart, { foreignKey: "cartId" });

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Product.hasMany(ProductImg, { foreignKey: "productId" });
ProductImg.belongsTo(Product, { foreignKey: "productId" });

ProductInCart.hasMany(ProductImg, { foreignKey: "productId" });
ProductImg.belongsTo(ProductInCart, { foreignKey: "productId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

db.sync()
  .then(() => console.log("Db synced"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Express app running!!", PORT);
});
