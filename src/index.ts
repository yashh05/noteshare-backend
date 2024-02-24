import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import connectDB from "./utils/db";
import User, { user } from "./models/user.model";
import MainRouter from "./routes/index.route";
import jwt, { JwtPayload } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { ERROR_MESSAGES } from "./config/config";
import sanitizedConfig from "./utils/sanitizedEnvs";
import { checkAuthorization } from "./services/socket.service";
import {
  checkUserAuthLevel,
  getDocById,
  getDocByIdAndUpdate,
} from "./services/doc.service";
import { Role } from "./controllers/doc.controller";

dotenv.config();

const app: Express = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://noteshare-client.vercel.app",
      "https://noteshare-client-wev1a1zca-yashcodewallah.vercel.app",
    ],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", MainRouter);

connectDB();
const server = app.listen(process.env.PORT || 5000, () => {
  console.log("server is listening");
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://noteshare-client.vercel.app",
      "https://noteshare-client-wev1a1zca-yashcodewallah.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// running

io.use(async (socket: Socket, next: (err?: Error) => void) => {
  const cookieHeader = socket.request.headers.cookie;
  const docId = socket.handshake.query.docId;
  let cookies: Record<string, string> = {};

  if (!cookieHeader || !docId || typeof docId !== "string") {
    return next(new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
  }

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    cookies = { ...cookies, [parts[0].trim()]: parts[1].trim() };
  });

  const authCookie = cookies?.authentication;
  if (!authCookie) {
    return next(new Error(ERROR_MESSAGES.UNAUTHORIZED_USER));
  }

  const token = authCookie.split("%20")[1]; // Adjust this according to your cookie structure
  if (!token) {
    return next(new Error(ERROR_MESSAGES.UNAUTHORIZED_USER));
  }

  try {
    const { userId } = jwt.verify(
      token,
      sanitizedConfig.jwtSecret
    ) as JwtPayload;
    if (!userId) {
      return next(new Error(ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    const authorized = await checkAuthorization({ userId, docId });
    if (!authorized) {
      return next(new Error(ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    const userAuthLevel = await checkUserAuthLevel(userId, docId);
    if (!userAuthLevel) {
      return next(new Error(ERROR_MESSAGES.UNAUTHORIZED_USER));
    }
    // console.log(userAuthLevel, "hii");

    socket.data = { userId, docId, authLevel: userAuthLevel };
    return next();
  } catch (err: any) {
    console.error("Error verifying token:", err);
    return next(err);
  }
});

io.on("connection", (socket) => {
  const {
    userId,
    docId,
    authLevel,
  }: { userId: string; docId: string; authLevel: Role } = socket.data;

  socket.on("get-doc", async () => {
    const doc = await getDocById(docId);
    if (doc) {
      socket.join(docId);
      socket.emit("load-doc", doc.docData, authLevel);
    }
  });

  socket.on("save-doc", async ({ docData }) => {
    // console.log(docData);
    const doc = await getDocByIdAndUpdate(docId, docData);
  });

  socket.on("send-changes", (delta) => {
    socket.to(docId).emit("receive-changes", delta);
  });
});
