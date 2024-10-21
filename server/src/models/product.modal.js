import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  productName: { type: String, required: true, trim: true },
  productDescription: { type: String, required: true, trim: true },
  productPrice: { type: Number, required: true },
  productImages: [{ url: String, altText: String }],
  productCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  productStock: { type: Number, required: true, default: 0 },
  productRating: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  productReviews: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      reviewText: String,
      rating: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
