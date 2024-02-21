import mongoose from "mongoose";
import z from "zod";

const addDocSchema = z.object({
  name: z
    .string({ required_error: "Enter Name" })
    .min(1, "Enter Document Name"),
  desc: z.string().optional(),
});

const accessSchema = z.object({
  docId: z.custom<mongoose.Types.ObjectId>(),
  email: z.string().email("Enter Valid Email"),
  role: z.enum(["readOnly", "readWrite"]),
});

const deleteDocSchema = z.object({
  docId: z.custom<mongoose.Types.ObjectId>(),
});

export { addDocSchema, accessSchema, deleteDocSchema };
