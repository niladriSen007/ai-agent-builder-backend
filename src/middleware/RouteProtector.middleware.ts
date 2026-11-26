import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../exceptions/ApiError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { NotFoundException } from "../exceptions/NotFound.error.js";
import { JWT_SECRET } from "../config/variables.js";
import { UserEntity } from "../entity/User.model.js";

export type AuthenticatedRequest = Request & {
  user?: NonNullable<Awaited<ReturnType<typeof UserEntity.findById>>>;
};

export const RouteProtector = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token) {
      throw new ApiError(401, "Token not found");
    }

    const userDetails: JwtPayload | string = jwt.verify(
      refresh_token,
      JWT_SECRET,
    );
    const user = await UserEntity.findById((userDetails as JwtPayload)?.userId);
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
    const userData = {
      ...user?._doc,
      accessToken: access_token,
    };
    req.user = userData;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }
};
