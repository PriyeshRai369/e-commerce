import { Router } from "express";
import {
  addAddress,
  addToCart,
  addWishlist,
  deleteAddress,
  deleteReview,
  removeFromCart,
  removeWishlist,
  updateAddress,
  updatePassword,
  updateReview,
  userLogin,
  userLogout,
  userRegistration,
  writeReview,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter
  .route("/signup")
  .post(upload.single("profilePicture"), userRegistration);
userRouter.route("/login").post(userLogin);
userRouter.route("/logout").get(userLogout);
userRouter.route("/add-address").post(authenticateUser, addAddress);
userRouter.route("/update-address").post(authenticateUser, updateAddress);
userRouter.route("/delete-address").post(authenticateUser, deleteAddress);
userRouter.route("/reset-password").post(authenticateUser, updatePassword);
userRouter.route("/write-review").post(authenticateUser, writeReview);
userRouter.route("/delete-review").post(authenticateUser, deleteReview);
userRouter.route("/update-review").post(authenticateUser, updateReview);
userRouter.route("/add-to-cart").post(authenticateUser, addToCart);
userRouter.route("/remove-cart").post(authenticateUser, removeFromCart);
userRouter.route("/add-to-wishlist").post(authenticateUser, addWishlist);
userRouter.route("/remove-from-wishlist").post(authenticateUser, removeWishlist);


export { userRouter };
