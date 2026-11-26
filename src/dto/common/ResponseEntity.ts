import type { Response } from "express";
import type { ApiResponse } from "./ApiResponse.dto.js";


export const ResponseEntity = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null,
): Response<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
