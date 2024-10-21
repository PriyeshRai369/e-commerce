import mongoose from "mongoose";

export async function dbConnect() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    if (!conn) {
      console.log("Database connection fail");
    }
    console.log("Database is connected successfully");
  } catch (error) {
    console.log("Something Error in Database connection.", error.message);
    process.exit(1);
  }
}
