import mongoose from "mongoose";
import { ERROR_MESSAGES } from "../config/config";
import Doc, { docSchema } from "../models/doc.model";
import { DocumentType } from "@typegoose/typegoose";
import { Role } from "../controllers/doc.controller";

const addDoc = async (
  name: string,
  desc: string | undefined,
  adminId: mongoose.Types.ObjectId
) => {
  try {
    const checkDoc = await Doc.findOne({ name, adminId });
    if (checkDoc) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_DOC);
    }
    return await Doc.create({ name, desc, adminId });
  } catch (e: any) {
    console.error(e.message);
    throw e;
  }
};

const getAllFiles = async (userId: mongoose.Types.ObjectId) => {
  try {
    return await Doc.find({
      $or: [
        { adminId: userId },
        { readonly: { $in: [userId] } },
        { readWrite: { $in: [userId] } },
      ],
    });
  } catch (e: any) {
    console.log(e.message);
    throw e;
  }
};

const getDocById = async (docId: string) => {
  const objectDocId = new mongoose.Types.ObjectId(docId);

  const doc = await Doc.findById(objectDocId).exec();
  return doc;
};

const getDocByNameAndAdminId = async (
  name: string,
  adminId: mongoose.Types.ObjectId
) => {
  return await Doc.find({ adminId, name });
};
// const verifyReader = async (email: string) => {
//   return await findUserByEmail(email);
// };

const removeRole = async (
  doc: DocumentType<docSchema>,
  newPersonId: mongoose.Types.ObjectId,
  role: Role
) => {
  try {
    if (role === Role.readWrite) {
      return await Doc.findByIdAndUpdate(doc._id, {
        $pull: { readWrite: newPersonId },
      });
    } else {
      return await Doc.findByIdAndUpdate(doc._id, {
        $pull: { readonly: newPersonId },
      });
    }
  } catch (e: any) {
    throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const grantRole = async (
  doc: DocumentType<docSchema>,
  newPersonId: mongoose.Types.ObjectId,
  role: "readOnly" | "readWrite"
) => {
  try {
    if (role === "readWrite") {
      await Doc.findByIdAndUpdate(doc._id, {
        $addToSet: { readWrite: newPersonId },
        $pull: { readonly: newPersonId }, // Remove from readOnly if present
      });
    } else {
      await Doc.findByIdAndUpdate(doc._id, {
        $addToSet: { readonly: newPersonId },
        $pull: { readWrite: newPersonId }, // Remove from readWrite if present
      });
    }
  } catch (e: any) {
    console.log(e.message);
    throw new Error(e.message);
  }
};

const deleteDoc = async (docId: string) => {
  return await Doc.findByIdAndDelete(docId);
};

const getDocByIdAndUpdate = async (docId: string, docData: any) => {
  return await Doc.findByIdAndUpdate(docId, { $set: { docData: docData } });
};

const checkUserAuthLevel = async (
  userId: string,
  docId: string
): Promise<Role> => {
  const doc = await Doc.findById(docId);
  if (!doc) {
    throw new Error(ERROR_MESSAGES.INVALID_DOC);
  }
  if (doc.adminId.toString() === userId) {
    return Role.Admin;
  } else if (doc.readonly?.includes(new mongoose.Types.ObjectId(userId))) {
    return Role.readOnly;
  } else if (doc.readWrite?.includes(new mongoose.Types.ObjectId(userId))) {
    return Role.readWrite;
  } else throw new Error(ERROR_MESSAGES.UNAUTHORIZED_USER);
};
export {
  addDoc,
  getAllFiles,
  getDocById,
  grantRole,
  removeRole,
  deleteDoc,
  getDocByIdAndUpdate,
  getDocByNameAndAdminId,
  checkUserAuthLevel,
};
