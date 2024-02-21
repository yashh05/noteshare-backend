import mongoose from "mongoose";
import sanitizedConfig from "./sanitizedEnvs";

async function connectDB() {
  const uri = sanitizedConfig.dbUrl;
  await mongoose.connect(uri);
  console.log("mongo connected");
}

export default connectDB;
