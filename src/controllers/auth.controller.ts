import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createToken } from "../services/auth.service";
import {
  comparePasswords,
  createUser,
  findUserByEmail,
} from "../services/user.service";
import { ERROR_MESSAGES } from "../config/config";
import sanitizedConfig from "../utils/sanitizedEnvs";

const handleSignUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await findUserByEmail(email);
    if (user) {
      throw new Error("User already exits");
    }
    const saltRounds = sanitizedConfig.saltRounds;

    const hashedPass = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser(name, email, hashedPass);
    console.log(newUser);

    const token = createToken({ userId: newUser._id });
    if (!token) {
      return res
        .status(500)
        .json({ status: "fail", error: ERROR_MESSAGES.TOKEN_CREATION_ERROR });
    }
    console.log(token);

    res.cookie("authentication", token);
    res.status(201).json({
      status: "success",
      message: "new user created",
      email: newUser.email,
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ status: "fail", error: error.message });
  }
};

const handleSignIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const newUser = await findUserByEmail(email);

    if (newUser) {
      const isValidPassword = await comparePasswords(
        password,
        newUser.password
      );

      if (!isValidPassword) {
        return res
          .status(400)
          .json({ status: "fail", error: ERROR_MESSAGES.WRONG_PASSWORD });
      }

      const token = createToken({ userId: newUser._id });
      if (!token) {
        throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      }

      res.cookie("authentication", token);
      res.status(200).json({
        status: "success",
        message: "user signed in",
        email: newUser.email,
      });
    } else {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ status: "fail", error: error.message });
  }
};

const handleSignOut = async (req: Request, res: Response) => {
  try {
    res.cookie("authentication", "");
    res.status(200).json({
      status: "success",
      message: "user logged out",
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ status: "fail", error: error.message });
  }
};

export { handleSignIn, handleSignUp, handleSignOut };
