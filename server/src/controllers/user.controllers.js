import { User } from "../models/user.modal.js";
import bcrypt from "bcrypt";
import { fileUpload } from "../helpers/cloudinery.js";
import { generateToken } from "../helpers/accesstokengenerator.js";
import Product from "../models/product.modal.js";

export async function userRegistration(req, res) {
  try {
    const { fname, lname, username, email, password, phoneNumber } = req.body;

    if (!fname || !lname || !username || !email || !password || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are mandatory" });
    }

    const userEmailexisted = await User.findOne({ email });

    if (userEmailexisted) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email. Try different email.",
      });
    }

    const userUsernameExisted = await User.findOne({ username });

    if (userUsernameExisted) {
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

    const newUser = await User.create({
      fname,
      lname,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      profilePicture,
    });

    const isUserCreated = await User.findOne(newUser._id).select("-password");

    if (!isUserCreated) {
      return res.status(400).json({
        success: false,
        message: "Unable to register the user, try again after sometime.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registration Success.",
      user: isUserCreated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function userLogin(req, res) {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message:
          "User not found with this email id or username. Please try with correct one.",
      });
    }

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
      return res.status(500).json({
        success: false,
        message: "Incorect password...! try again...",
      });
    }

    const accessToken = await generateToken(user);
    const options = {
      httpOnly: true,
      secure: false,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .json({ success: true, message: "User login success", accessToken });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal error. Try after some time.",
    });
  }
}

export async function userLogout(req, res) {
  try {
    const options = {
      httpOnly: true,
      secure: false,
    };
    return res
      .status(201)
      .clearCookie("accessToken", options)
      .json({ success: true, message: "User Logout success" });
  } catch (error) {
    console.log("Error :- ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! try after some time...",
    });
  }
}

export async function addAddress(req, res) {
  try {
    const { streetAddress, city, state, postalCode, country } = req.body;
    const userId = req.user._id;

    if (!streetAddress || !city || !state || !postalCode || !country) {
      return res
        .status(500)
        .json({ success: false, message: "Please Fill Full address...!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.address.push({
      streetAddress,
      city,
      state,
      postalCode,
      country,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully.",
      address: user.address,
    });
  } catch (error) {
    console.log("Error hear:- ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! try after some time...",
    });
  }
}

export async function updateAddress(req, res) {
  try {
    const userId = req.user._id;
    const { addressId, streetAddress, city, state, postalCode, country } =
      req.body;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    if (streetAddress) user.address[addressIndex].streetAddress = streetAddress;
    if (city) user.address[addressIndex].city = city;
    if (state) user.address[addressIndex].state = state;
    if (postalCode) user.address[addressIndex].postalCode = postalCode;
    if (country) user.address[addressIndex].country = country;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address: user.address[addressIndex],
    });
  } catch (error) {
    console.error("Error while updating address:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

export async function deleteAddress(req, res) {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    user.address.splice(addressIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      address: user.address,
    });
  } catch (error) {
    console.error("Error while updating address:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

export async function updatePassword(req, res) {
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Unauthorised action...! contect to admin...!",
      });
    }
    const matchPassword = await bcrypt.compare(oldPassword, user.password);

    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

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

export async function writeReview(req, res) {
  try {
    const { reviewText, rating, productId } = req.body;

    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    if (!reviewText) {
      return res
        .status(500)
        .json({ success: false, message: "Please write at list 10 words." });
    }

    if (!productId) {
      return res.status(500).json({
        success: false,
        message: "Please select the available product.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.productReviews.push({
      userId: userId,
      reviewText: reviewText,
      rating: rating,
    });

    const totalReviews = product.productReviews.length;
    const totalRating = product.productReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    product.productRating = totalRating / totalReviews;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully.",
    });
  } catch (error) {
    console.log("Error while submiting product review.", error.message);
    return res.state(500).json({
      success: false,
      message: "Internal error...! Please try after some time...!",
    });
  }
}

export async function deleteReview(req, res) {
  try {
    const userId = req.user._id;
    const { productId, reviewId } = req.body;

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Please log in.",
      });
    }

    if (!productId || !reviewId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Review ID are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const reviewIndex = product.productReviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (
      product.productReviews[reviewIndex].userId.toString() !==
        userId.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review.",
      });
    }

    product.productReviews.splice(reviewIndex, 1);

    const totalReviews = product.productReviews.length;
    const totalRating = product.productReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    product.productRating = totalRating / totalReviews;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function updateReview(req, res) {
  try {
    const { productId, reviewId, reviewText } = req.body;
    const userId = req.user._id;
    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Please log in.",
      });
    }

    if (!productId || !reviewId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Review ID are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const review = product.productReviews.find(
      (review) => review._id.toString() === reviewId
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (
      review.userId.toString() !== userId.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this review.",
      });
    }

    review.reviewText = reviewText || review.reviewText;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    console.error("Error while updating review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function addToCart(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !quantity) {
    return res.status(400).json({
      success: false,
      message: "Product ID and quantity are required.",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingProductIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    const productPrice = product.productPrice;

    if (existingProductIndex > -1) {
      user.cart[existingProductIndex].quantity += quantity;
      user.cart[existingProductIndex].price =
        productPrice * user.cart[existingProductIndex].quantity;
    } else {
      user.cart.push({ productId, quantity, price: productPrice * quantity });
    }

    await user.save();

    return res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingProductIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    const currentQuantity = user.cart[existingProductIndex].quantity;
    const productPrice = (await Product.findById(productId)).productPrice;

    if (quantity >= currentQuantity) {
      user.cart.splice(existingProductIndex, 1);
    } else {
      user.cart[existingProductIndex].quantity -= quantity;
      user.cart[existingProductIndex].price =
        productPrice * user.cart[existingProductIndex].quantity;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully.",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error while deleting product from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

export async function addWishlist(req, res) {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingProductIndex = user.wishlist.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist.",
      });
    }

    user.wishlist.push({
      productId: product._id,
      productName: product.productName,
      productImage: product.productImages[0].url,
      price: product.productPrice,
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully.",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("Error adding to favourite List", error.message);
    return res.status(400).json({
      success: false,
      message: "Internal error...! Try after some time...!",
    });
  }
}

export async function removeWishlist(req, res) {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingProductIndex = user.wishlist.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingProductIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Product is not in the wishlist.",
      });
    }
    user.wishlist.splice(existingProductIndex, 1);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully.",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("Error adding to favourite List", error.message);
    return res.status(400).json({
      success: false,
      message: "Internal error...! Try after some time...!",
    });
  }
}
