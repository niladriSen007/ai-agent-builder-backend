import { ApiError } from "./ApiError.js";

export class NotAuthorized extends ApiError {
  constructor(message = "Resource not found") {
    super(401, message);
  }
}
