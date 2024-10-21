import jwt from "jsonwebtoken";
import { User } from "../models/user.modal.js";
import { Admin } from "../models/admin.modal.js";

export const authenticateUser = async (req, res, next) => {
  const token =
    (await req.cookies.accessToken) ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    let user = await User.findById(verified.id).select("-password");
    let admin = await Admin.findById(verified.id).select("-password");

    if (!user && !admin) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid token. User or Admin not found.",
        });
    }

    req.user = user || admin;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(400).json({ success: false, message: "Invalid token." });
  }
};

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You are not authorized to access this resource.",
      });
    }
    next();
  };
}
