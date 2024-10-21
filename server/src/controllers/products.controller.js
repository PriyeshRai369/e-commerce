import Product from "../models/product.modal.js";
import { fileUpload } from "../helpers/cloudinery.js";
import fs from "fs";

export async function addProduct(req, res) {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productStock,
      isFeatured,
    } = req.body;

    if (!productName || !productDescription || !productPrice || !productStock) {
      return res.status(500).json({
        success: false,
        message: "Please fill all the necessary fields.",
      });
    }

    const exitedProduct = await Product.findOne({ productName });

    if (exitedProduct) {
      return res.status(500).json({
        success: false,
        message: "Product you want to add is already existed in database.",
      });
    }

    let productImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadedImage = await fileUpload(file.path);
          if (uploadedImage) {
            productImages.push({
              url: uploadedImage,
              altText: productDescription || "",
            });
          }

          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(`Error deleting file: ${file.path}`, err);
            } else {
              console.log(`File deleted successfully: ${file.path}`);
            }
          });
        } catch (error) {
          console.error(
            `Error processing file: ${file.path}. Error: ${error.message}`
          );
        }
      }
    }

    const newProduct = await Product.create({
      productName,
      productDescription,
      productPrice,
      productStock,
      productImages,
      isFeatured,
    });

    const isProductAdded = await Product.findOne(newProduct._id);

    if (!isProductAdded) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to add new Product. Please tyy again after some time...!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added successfully.",
      newProduct,
    });
  } catch (error) {
    console.log("Error here", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error...! Try after some time...",
    });
  }
}

export async function updateStock(req, res) {
  try {
    const { productStock, productId } = req.body;
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized action. Please log in first.",
      });
    }

    if (!productId || !productStock) {
      return res.status(500).json({
        success: false,
        message: "Incorrect detils provided, please fill up proper details.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.productStock += productStock;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product stock updated successfully.",
      updatedStock: product.productStock,
    });
  } catch (error) {
    console.log("Error at updating product stocks.", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! Try again after some time...!",
    });
  }
}

export async function allProduct(req, res) {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error. Please try again later.",
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!userId || userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Admin privileges required.",
      });
    }
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(500)
        .json({ success: false, message: "Please provide valid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await Product.findByIdAndDelete(productId);
    return res.status(200).json({
      success: true,
      message: `Product with ID: ${productId} has been deleted successfully.`,
    });
  } catch (error) {
    console.log("Error while deleting product.", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! Please try after some time...!",
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!userId || userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action. Admin privileges required.",
      });
    }
    const { productName, productDescription, productPrice, productId } =
      req.body;

    if (!productId) {
      return res
        .status(500)
        .json({ success: false, message: "Please provide valid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (productName) product.productName = productName;
    if (productDescription) product.productDescription = productDescription;
    if (productPrice) product.productPrice = productPrice;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.log("Error while updating product.", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error...! Please try after some time...!",
    });
  }
}
