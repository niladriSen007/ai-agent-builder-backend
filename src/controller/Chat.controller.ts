import type { NextFunction, Request, Response } from "express";
import type { ChatRequest } from "../dto/request/ChatRequest.dto.js";
import type { ChatService } from "../services/Chat.services.js";
import { NotFoundException } from "../exceptions/NotFound.error.js";
import type { AuthenticatedRequest } from "../middleware/RouteProtector.middleware.js";
import { graphWorkflow } from "../ai_chat_utils/Chat.graph.js";
import { HumanMessage } from "@langchain/core/messages";
import { ResponseEntity } from "../dto/common/ResponseEntity.js";

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  chat = async (
    req: AuthenticatedRequest & Request<{}, unknown, ChatRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userMessage } = req?.body;
      if (!userMessage) {
          throw new NotFoundException("User message required");
        }
        
        const threadId = String(req?.user?._id);
        
        const data = await graphWorkflow.invoke(
            {
                messages: [new HumanMessage(userMessage)],
            },
        {
            configurable: { thread_id: threadId },
        },
      );

      const messages = data.messages.map((message) => {
        const type = message.getType();

        return {
          id: message.id,
          role:
            type === "human"
              ? "user"
              : type === "ai"
                ? "assistant"
                : type,
          content: message.content,
        };
      });

      return ResponseEntity(res, 200, "Chat messages fetched successfully", {
        messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
