import express from "express";
import { validate } from "../middlewares/validator";
import { createUserSchema, loginUserSchema } from "../schema/user.schema";
import {
  handleSignIn,
  handleSignOut,
  handleSignUp,
} from "../controllers/auth.controller";
import errorHandler from "../middlewares/errorHandler";

const router = express.Router();

router.post("/signup", validate(createUserSchema), handleSignUp);
router.post("/signin", validate(loginUserSchema), handleSignIn);
router.get("/signout", handleSignOut);

router.use(errorHandler);

export default router;
