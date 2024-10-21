import mongoose, { Schema } from "mongoose";
const sliderSchema = new Schema(
  {
    bannerImg: [
      {
        url: {
          type: String,
          required: true,
        },
        title: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Slider = mongoose.model("Slider", sliderSchema);

export default Slider;
