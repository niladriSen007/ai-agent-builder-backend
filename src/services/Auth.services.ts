import { response, type Response } from "express";
import { AuthRepository } from "../repository/Auth.repository.js";
import { ApiError } from "../exceptions/ApiError.js";
import { NotFoundException } from "../exceptions/NotFound.error.js";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { auth_verify_app } from "../config/firebaseConnection.js";
import type { LoginRequest } from "../dto/request/LoginRequest.dto.js";
import { UserEntity, type UserEntityDocument } from "../entity/User.model.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/variables.js";
import type { NextFunction, Request } from "express";
import { NotAuthorized } from "../exceptions/NotAuthorized.error.js";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(
    loginRequest: LoginRequest,
    response: Response,
  ): Promise<{
    name: string;
    email: string;
    profilePicture: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const { token } = loginRequest;

    if (!token) {
      throw new NotFoundException("Token not found");
    }

    const userDetails: DecodedIdToken =
      await getAuth(auth_verify_app).verifyIdToken(token);

    const user: UserEntityDocument | null =
      await this.authRepository.login(userDetails);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const access_token = jwt.sign(
      {
        userId: user?._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const refresh_token = jwt.sign(
      {
        userId: user?._id,
      },
      JWT_SECRET,
      {
        expiresIn: "60d",
      },
    );

    response.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 24 * 60 * 60 * 1000,
    });

    return {
      name: user?.name ?? "",
      email: user?.email ?? "",
      profilePicture: user?.profilePicture ?? "",
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }

  async refreshToken(req: Request, res: Response) {
    let refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token) {
      throw new NotAuthorized("Token not found");
    }

    const userDetails: JwtPayload | string = jwt.verify(
      refresh_token,
      JWT_SECRET,
    );

    const user = await UserEntity.findById((userDetails as JwtPayload)?.userId);

    const access_token = jwt.sign(
      {
        userId: user?._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    refresh_token = jwt.sign(
      {
        userId: user?._id,
      },
      JWT_SECRET,
      {
        expiresIn: "60d",
      },
    );

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 24 * 60 * 60 * 1000,
    });

    return access_token
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return true;
  }
}
