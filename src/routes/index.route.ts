import express from "express";
import AuthRouter from "./auth.route";
import DocRouter from "./doc.route";
import authentication from "../middlewares/authentication";

const router = express.Router();

router.use("/auth", AuthRouter);
router.use("/doc", authentication, DocRouter);
export default router;
