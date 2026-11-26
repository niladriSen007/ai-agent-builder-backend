import { ApiError } from "./ApiError.js";


export class NotFoundException extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

