import type { NextFunction, Request, Response } from "express";
import { ResponseEntity } from "../dto/common/ResponseEntity.js";
import type {
  CreateAgentRequest,
  PatchAgentRequest,
} from "../dto/request/AgentRequest.dto.js";
import { ApiError } from "../exceptions/ApiError.js";
import type { AuthenticatedRequest } from "../middleware/RouteProtector.middleware.js";
import type { AgentService as AgentServiceType } from "../services/Agent.services.js";

type AgentRequest<Body> = AuthenticatedRequest &
  Request<{ agentId: string }, unknown, Body>;

export class AgentController {
  constructor(private readonly agentService: AgentServiceType) {}

  getAgents = async (
    req: AgentRequest<unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const agents = await this.agentService.getAgents(req.user._id);
      return ResponseEntity(res, 200, "Agents fetched successfully", agents);
    } catch (error) {
      next(error);
    }
  };

  getAgentById = async (
    req: AgentRequest<unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const agent = await this.agentService.getAgentById(
        req.user._id,
        req.params.agentId,
      );
      return ResponseEntity(res, 200, "Agent fetched successfully", agent);
    } catch (error) {
      next(error);
    }
  };

  createAgent = async (
    req: AgentRequest<CreateAgentRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const agent = await this.agentService.createAgent(
        req.user._id,
        req.body,
      );
      return ResponseEntity(res, 201, "Agent created successfully", agent);
    } catch (error) {
      next(error);
    }
  };

  patchAgent = async (
    req: AgentRequest<PatchAgentRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const agent = await this.agentService.patchAgent(
        req.user._id,
        req.params.agentId,
        req.body,
      );
      return ResponseEntity(res, 200, "Agent updated successfully", agent);
    } catch (error) {
      next(error);
    }
  };
}
