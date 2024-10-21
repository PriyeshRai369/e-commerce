import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: "priyesh",
  api_key: "922895654313775",
  api_secret: "TpuVPx_FineoRxh2i3gIt20OSPg",
});

const fileUpload = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("File has been uploaded:", response.url);
    return response.url;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    return null;
  }
};

export { fileUpload };
