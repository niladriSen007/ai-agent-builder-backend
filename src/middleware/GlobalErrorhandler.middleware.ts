import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../exceptions/ApiError.js";


export const GlobalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  const response = {
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
