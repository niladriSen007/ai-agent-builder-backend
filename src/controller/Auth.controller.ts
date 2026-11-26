import { ResponseEntity } from "./../dto/common/ResponseEntity.js";

import type { NextFunction, Request, Response } from "express";
import type { LoginRequest } from "../dto/request/LoginRequest.dto.js";
import { type AuthService as AuthServiceType } from "../services/Auth.services.js";
import type { AuthenticatedRequest } from "../middleware/RouteProtector.middleware.js";
import { refreshToken } from "firebase-admin";
import { ApiError } from "../exceptions/ApiError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/variables.js";
import { UserEntity } from "../entity/User.model.js";

export class AuthController {
  constructor(private readonly authService: AuthServiceType) {}

  login = async (
    req: Request<{}, any, LoginRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userData: {
        name: string;
        email: string;
        profilePicture: string;
        accessToken: string;
        refreshToken: string;
      } = await this.authService.login(req.body, res);

      return ResponseEntity(res, 201, "User Logged in Successfully", {
        userDetails: {
          ...userData,
        },
        refreshToken: userData?.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = await this.authService.refreshToken(req, res);

      return ResponseEntity(res, 200, "Token rotation successful", {
        accessToken: access_token,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.authService.logout(req, res);
      return ResponseEntity(res, 200, "User logged out successfully", null);
    } catch (error) {
      next(error);
    }
  };

  myDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req?.user;
      return ResponseEntity(
        res,
        200,
        "User details fetched successfully",
        user,
      );
    } catch (error) {
      next(error);
    }
  };
}
