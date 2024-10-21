import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/auth.middlewares.js";
import {
  addSlider,
  adminLogin,
  adminLogout,
  adminRegistration,
  removeBanner,
  updateAdminPassword,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter
  .route("/admin-signup")
  .post(upload.single("profilePicture"), adminRegistration);
adminRouter.route("/admin-login").post(adminLogin);
adminRouter.route("/admin-logout").get(adminLogout);
adminRouter
  .route("/reset-password")
  .post(authenticateUser, updateAdminPassword);
adminRouter
  .route("/upload-banner")
  .post(
    authenticateUser,
    authorizeRole("Admin"),
    upload.single("bannerImg"),
    addSlider
);

adminRouter.route('/remove-banner').post(authenticateUser, authorizeRole("Admin"), removeBanner)

export { adminRouter };
