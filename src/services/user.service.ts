import mongoose from "mongoose";
import User from "../models/user.model";
import bcrypt from "bcrypt";

const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

const findUserById = async (id: mongoose.Types.ObjectId) => {
  return await User.findById(id);
};

const createUser = async (name: string, email: string, password: string) => {
  return await User.create({ name, email, password });
};
const comparePasswords = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export { findUserById, findUserByEmail, createUser, comparePasswords };
