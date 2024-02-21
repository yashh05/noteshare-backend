import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const err = error.errors.map((indiErr) => {
          return {
            path: indiErr.path[0],
            message: indiErr.message,
          };
        });
        return res.status(400).json({
          status: "fail",
          error: err,
        });
      } else {
        res
          .status(400)
          .json({ status: "fail", type: "ZodError", error: error.message });
      }
    }
  };
