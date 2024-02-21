import express from "express";
import { validate } from "../middlewares/validator";
import {
  accessSchema,
  addDocSchema,
  deleteDocSchema,
} from "../schema/doc.schema";
import {
  handleAddDoc,
  handleDeleteDoc,
  handleGetAllUser,
  handleGetFiles,
  handleNewAccessRole,
  handleRemoveRole,
} from "../controllers/doc.controller";

const router = express.Router();

router.post("/addDoc", validate(addDocSchema), handleAddDoc);
router.get("/getAllDocs", handleGetFiles);
router.post("/getAllUser", validate(deleteDocSchema), handleGetAllUser);
router.post("/grantRole", validate(accessSchema), handleNewAccessRole);
router.post("/removeRole", validate(accessSchema), handleRemoveRole);
router.delete("/deleteDoc", validate(deleteDocSchema), handleDeleteDoc);

export default router;
