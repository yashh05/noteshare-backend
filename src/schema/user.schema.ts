import { object, string } from "zod";

const createUserSchema = object({
  name: string({ required_error: "Enter your name" }),
  email: string({ required_error: "Enter your email" }).email("Invalid email"),
  password: string({ required_error: "Enter your password" }).min(
    6,
    "Password should be atleast 6 digits"
  ),
});

const loginUserSchema = object({
  email: string({ required_error: "Enter your email" }).email("Invalid email"),
  password: string({ required_error: "Enter your password" }).min(
    6,
    "Password should be atleast 6 digits"
  ),
});

export { createUserSchema, loginUserSchema };
