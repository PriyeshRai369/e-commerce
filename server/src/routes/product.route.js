import { Router } from "express";
import {
  addProduct,
  allProduct,
  deleteProduct,
  updateProduct,
  updateStock,
} from "../controllers/products.controller.js";
import { upload } from "../middlewares/multer.js";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/auth.middlewares.js";

const productRoute = Router();

productRoute
  .route("/add-product")
  .post(
    authenticateUser,
    authorizeRole("Admin"),
    upload.array("productImages", 10),
    addProduct
  );
productRoute
  .route("/add-stock")
  .post(authenticateUser, authorizeRole("Admin"), updateStock);
productRoute.route("/all-product").get(allProduct);
productRoute
  .route("/delete-product")
  .post(authenticateUser, authorizeRole("Admin"), deleteProduct);
productRoute
  .route("/update-product")
  .post(authenticateUser, authorizeRole("Admin"), updateProduct);
export { productRoute };
