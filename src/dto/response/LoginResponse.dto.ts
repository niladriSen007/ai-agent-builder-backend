import type { Response } from "express";

export interface LoginResponse extends Response {
  name: string;
  email: string;
  profilePicture: string;
}
