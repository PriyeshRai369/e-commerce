import jwt from "jsonwebtoken";

export async function generateToken(user) {
  try {
    return await jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Token generation failed");
  }
}
