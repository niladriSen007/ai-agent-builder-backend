import { Router, type Request, type Response } from "express";
import { AuthController } from "../controller/Auth.controller.js";
import { AuthService } from "../services/Auth.services.js";
import { AuthRepository } from "../repository/Auth.repository.js";
import type { LoginRequest } from "../dto/request/LoginRequest.dto.js";
import { RouteProtector } from "../middleware/RouteProtector.middleware.js";

export const authRouter: Router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

authRouter.post("/login", authController.login);

authRouter.post("/refresh-token", authController.refreshToken);

authRouter.post("/logout", authController.logout);

authRouter.get("/myDetails",RouteProtector, authController.myDetails)
