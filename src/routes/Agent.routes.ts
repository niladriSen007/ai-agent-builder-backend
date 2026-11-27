import { Router } from "express";
import { AgentController } from "../controller/Agent.controller.js";
import { AgentRepository } from "../repository/Agent.repository.js";
import { AgentService } from "../services/Agent.services.js";
import { RouteProtector } from "../middleware/RouteProtector.middleware.js";

export const agentRouter: Router = Router();

const agentRepository = new AgentRepository();
const agentService = new AgentService(agentRepository);
const agentController = new AgentController(agentService);

agentRouter.get("/", RouteProtector, agentController.getAgents);
agentRouter.get("/:agentId", RouteProtector, agentController.getAgentById);
agentRouter.post("/", RouteProtector, agentController.createAgent);
agentRouter.patch("/:agentId", RouteProtector, agentController.patchAgent);
