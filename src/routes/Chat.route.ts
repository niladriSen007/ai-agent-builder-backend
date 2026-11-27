import { Router, type Request, type Response } from "express";
import { RouteProtector } from "../middleware/RouteProtector.middleware.js";
import { ChatService } from "../services/Chat.services.js";
import { ChatController } from "../controller/Chat.controller.js";

export const chatRouter: Router = Router();

// const chatRepository = new chatRepository();
const chatService = new ChatService();
const chatController = new ChatController(chatService);


chatRouter.post("/ai", RouteProtector, chatController.chat);
