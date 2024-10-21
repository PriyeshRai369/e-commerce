import { Admin } from "../models/admin.modal.js";
import bcrypt from "bcrypt";
import { fileUpload } from "../helpers/cloudinery.js";
import { generateToken } from "../helpers/accesstokengenerator.js";
import Slider from "../models/slider.modal.js";

export async function adminRegistration(req, res) {
  try {
    const { fullname, username, email, password, phoneNumber } = req.body;
    if (!fullname || !username || !email || !password || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are mandatory" });
    }
    const adminEmailExisted = await Admin.findOne({ email });
    if (adminEmailExisted) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email. Try a different email.",
      });
    }
    const adminUsernameExisted = await Admin.findOne({ username });
    if (adminUsernameExisted) {
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please choose another username.",
      });
    }
    let profilePicture = "";
    if (req.file) {
      console.log("File path before upload:", req.file.path);
      profilePicture = await fileUpload(req.file.path);
      if (!profilePicture) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      profilePicture,
    });

    const isAdminCreated = await Admin.findOne({ _id: newAdmin._id }).select(
      "-password"
    );

    if (!isAdminCreated) {
      return res.status(400).json({
        success: false,
        message: "Unable to register the Admin, try again after some time.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Admin registration successful.",
      admin: isAdminCreated,
    });
  } catch (error) {
    console.log("Error while registering new Admin", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function adminLogin(req, res) {
  try {
    const { loginId, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          "Admin not found with this email or username. Please try again with the correct one.",
      });
    }

    const verifyPassword = await bcrypt.compare(password, admin.password);

    if (!verifyPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const accessToken = await generateToken(admin);

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      message: "Admin login successful.",
      accessToken,
    });
  } catch (error) {
    console.error("Error during admin login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

export async function adminLogout(req, res) {
  try {
    const options = {
      httpOnly: true,
      secure: false,
    };
    return res
      .status(201)
      .clearCookie("accessToken", options)
      .json({ success: true, message: "Admin Logout success" });
  } catch (error) {
    console.log("Error :- ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! try after some time...",
    });
  }
}

export async function updateAdminPassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are necessary.",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and New password can't be same.",
      });
    }

    const admin = await Admin.findById(userId);

    if (!admin) {
      return res.status(500).json({
        success: false,
        message: "Unauthorised action...! contect to admin...!",
      });
    }
    const matchPassword = await bcrypt.compare(oldPassword, admin.password);

    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

export async function addSlider(req, res) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!userId || userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Admin privileges required.",
      });
    }

    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a banner image.",
      });
    }

    const uploadedImageUrl = await fileUpload(req.file.path);
    if (!uploadedImageUrl) {
      return res.status(500).json({
        success: false,
        message: "Error uploading the image. Try again later.",
      });
    }

    const slider = await Slider.findOne();

    if (!slider) {
      const newSlider = new Slider({
        bannerImg: [
          {
            url: uploadedImageUrl,
            title,
            description,
          },
        ],
      });
      await newSlider.save();

      return res.status(201).json({
        success: true,
        message: "Banner image uploaded successfully.",
        slider: newSlider,
      });
    }

    slider.bannerImg.push({
      url: uploadedImageUrl,
      title,
      description,
    });

    await slider.save();

    return res.status(201).json({
      success: true,
      message: "Banner image uploaded successfully.",
      slider: slider,
    });
  } catch (error) {
    console.error("Error while uploading banner ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function removeBanner(req, res) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!userId || userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Admin privileges required.",
      });
    }

    const { bannerId } = req.body;

    if (!bannerId) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required.",
      });
    }

    const slider = await Slider.findOne();

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found.",
      });
    }

    const bannerIndex = slider.bannerImg.findIndex(
      (banner) => banner._id.toString() === bannerId
    );

    if (bannerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    slider.bannerImg.splice(bannerIndex, 1);

    await slider.save();

    return res.status(200).json({
      success: true,
      message: "Banner removed successfully.",
    });
  } catch (error) {
    console.error("Error while removing banner ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
