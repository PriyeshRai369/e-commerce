import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    profilePicture: String,

    address: [
      {
        streetAddress: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    cart: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        price: Number,
      },
    ],
    wishlist: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        productName: { type: String, required: true },
        productImage: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    orderHistory: [
      {
        orderId: mongoose.Schema.Types.ObjectId,
        orderDate: Date,
        status: String,
        totalAmount: Number,
        paymentMethod: String,
      },
    ],
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
