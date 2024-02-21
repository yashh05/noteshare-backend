import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sanitizedConfig from "../utils/sanitizedEnvs";

function createToken(credential: { userId: mongoose.Types.ObjectId }) {
  try {
    const jwtSecret = sanitizedConfig.jwtSecret;
    const signature = jwt.sign(credential, jwtSecret);
    return "Bearer " + signature;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
}

function verifyToken(token: string) {
  try {
    const jwtSecret = sanitizedConfig.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded) {
      throw new Error("JWT not verified");
    }
    return decoded;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
}

export { createToken, verifyToken };
