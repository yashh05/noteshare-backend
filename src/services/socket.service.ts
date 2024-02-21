import mongoose from "mongoose";
import { ERROR_MESSAGES } from "../config/config";
import Doc from "../models/doc.model";

export const checkAuthorization = async ({
  userId,
  docId,
}: {
  userId: string;
  docId: string;
}) => {
  const doc = await Doc.findById(docId);
  if (
    doc &&
    (doc.adminId.toString() === userId ||
      doc.readonly?.includes(new mongoose.Types.ObjectId(userId)) ||
      doc.readWrite?.includes(new mongoose.Types.ObjectId(userId)))
  ) {
    return true;
  }
  return false;
};
