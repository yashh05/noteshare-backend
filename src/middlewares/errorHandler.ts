import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.message);
  res.status(500).json({ status: "fail", error: error.message });
};

export default errorHandler;
