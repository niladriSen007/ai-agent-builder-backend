import express, { type Express } from "express";
import { authRouter } from "./routes/Auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { GlobalErrorHandler } from "./middleware/GlobalErrorhandler.middleware.js";

export const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

// Register module routes
app.use("/api/v1/auth", authRouter);
app.use(GlobalErrorHandler);
