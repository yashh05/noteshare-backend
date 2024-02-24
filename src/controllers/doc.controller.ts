import {
  addDoc,
  deleteDoc,
  getAllFiles,
  getDocById,
  getDocByNameAndAdminId,
  grantRole,
  removeRole,
} from "../services/doc.service";
import { Request, Response, NextFunction, response } from "express";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/config";
import { findUserByEmail, findUserById } from "../services/user.service";
import { user } from "../models/user.model";
import { Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";

export enum Role {
  Admin = "Admin",
  readOnly = "readOnly",
  readWrite = "readWrite",
}

const handleAddDoc = async (req: Request, res: Response) => {
  try {
    const { name, desc } = req.body;
    const adminId = res.locals.userId;

    await addDoc(name, desc, adminId);
    res
      .status(201)
      .json({ status: "success", message: SUCCESS_MESSAGES.DOC_CREATED });
  } catch (e: any) {
    res.status(500).json({ status: "fail", error: e.message });
  }
};

const handleGetAllUser = async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals;
    const { docId } = req.body;

    const doc = await getDocById(docId);

    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", error: "No document found" });
    }

    if (doc.adminId.toString() !== userId) {
      return res
        .status(403)
        .json({ status: "fail", error: ERROR_MESSAGES.UNAUTHORIZED_USER });
    }

    let data: { role: Role; roleId: Ref<user> }[] = [];

    const readOnlyArray = doc.readonly?.map((roleId) => ({
      role: Role.readOnly,
      roleId,
    }));
    const readWriteArray = doc.readWrite?.map((roleId) => ({
      role: Role.readWrite,
      roleId,
    }));

    if (readOnlyArray && readOnlyArray.length > 0) {
      data = data.concat(readOnlyArray);
    }

    if (readWriteArray && readWriteArray.length > 0) {
      data = data.concat(readWriteArray);
    }
    // console.log(data);

    const filteredDataPromises: Promise<{ role: Role; email: string }>[] =
      data.map(async (item) => {
        try {
          const user = await findUserById(
            new mongoose.Types.ObjectId(item.roleId._id)
          );
          if (!user) {
            throw new Error("User not found");
          }
          return {
            role: item.role,
            email: user.email,
          };
        } catch (error) {
          return { role: item.role, email: "User not found" };
        }
      });

    const filteredData = await Promise.all(filteredDataPromises);

    return res.status(200).json({ status: "success", users: filteredData });
  } catch (error: any) {
    console.error(error.message);
    res
      .status(500)
      .json({ status: "fail", error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const handleGetFiles = async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals;
    const files = await getAllFiles(userId);
    // console.log(files);

    const data = files.map((file) => {
      let role: Role = Role.Admin;

      if (file.readonly?.includes(userId)) {
        role = Role.readOnly;
      } else if (file.readWrite?.includes(userId)) {
        role = Role.readWrite;
      }

      return { docId: file._id, name: file.name, desc: file.desc, role };
    });
    // console.log(data);
    return res.status(200).json({ status: "success", docs: data });
  } catch (e: any) {
    console.error(e.message);
    res
      .status(500)
      .json({ status: "fail", error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

const handleNewAccessRole = async (req: Request, res: Response) => {
  // console.log("hello");

  try {
    const {
      docId,
      email,
      role,
    }: { docId: string; email: string; role: "readOnly" | "readWrite" } =
      req.body;

    const { userId } = res.locals;

    const doc = await getDocById(docId);
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", error: ERROR_MESSAGES.INVALID_DOC });
    }

    if (doc.adminId.toString() !== userId) {
      throw new Error(ERROR_MESSAGES.ACCESS_CHANGE_NOT_ALLOWED);
    }

    const newPerson = await findUserByEmail(email);
    // console.log(newPerson);

    if (!newPerson) {
      return res
        .status(404)
        .json({ status: "fail", error: ERROR_MESSAGES.EMAIL_NOT_REGISTERED });
    }

    await grantRole(doc, newPerson._id, role);
    res
      .status(200)
      .json({ status: "success", message: SUCCESS_MESSAGES.ACCESS_GRANTED });
  } catch (e: any) {
    console.error(e.message);
    res.status(500).json({ status: "fail", error: e.message });
  }
};

const handleRemoveRole = async (req: Request, res: Response) => {
  try {
    const { docId, email, role }: { docId: string; email: string; role: Role } =
      req.body;

    const { userId } = res.locals;

    const doc = await getDocById(docId);
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", error: ERROR_MESSAGES.INVALID_DOC });
    }

    if (doc.adminId.toString() !== userId) {
      throw new Error(ERROR_MESSAGES.ACCESS_CHANGE_NOT_ALLOWED);
    }

    const newPerson = await findUserByEmail(email);
    if (!newPerson) {
      return res
        .status(404)
        .json({ status: "fail", error: ERROR_MESSAGES.EMAIL_NOT_REGISTERED });
    }

    await removeRole(doc, newPerson.id, role);
    res
      .status(200)
      .json({ status: "success", message: SUCCESS_MESSAGES.ACCESS_REMOVED });
  } catch (e: any) {
    res.status(500).json({ status: "fail", error: e.message });
  }
};

const handleDeleteDoc = async (req: Request, res: Response) => {
  try {
    const { docId } = req.body;
    const { userId } = res.locals;

    const doc = await getDocById(docId);
    if (!doc) {
      return res
        .status(404)
        .json({ status: "fail", error: ERROR_MESSAGES.INVALID_DOC });
    }

    if (doc.adminId.toString() !== userId) {
      throw new Error(ERROR_MESSAGES.ACCESS_CHANGE_NOT_ALLOWED);
    }

    await deleteDoc(docId);
    res.status(200).json({ status: "success" });
  } catch (e: any) {
    res.status(500).json({ status: "fail", error: e.message });
  }
};

export {
  handleAddDoc,
  handleGetFiles,
  handleNewAccessRole,
  handleRemoveRole,
  handleGetAllUser,
  handleDeleteDoc,
};
