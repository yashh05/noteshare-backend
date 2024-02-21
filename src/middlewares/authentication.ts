import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ERROR_MESSAGES } from "../config/config";
import sanitizedConfig from "../utils/sanitizedEnvs";

const authentication = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.authentication;
    const jwtSecret = sanitizedConfig.jwtSecret;

    if (!token || typeof token !== "string" || !token.startsWith("Bearer")) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED_USER);
    }

    const coded = token.split(" ")[1];

    const { userId } = jwt.verify(coded, jwtSecret) as JwtPayload;
    if (!userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED_USER);
    }
    res.locals.userId = userId;
    next();
  } catch (err: any) {
    console.log(err);
    return res.status(401).json({ status: "fail", error: err.message });
  }
};

export default authentication;
