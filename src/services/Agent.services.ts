import { Types } from "mongoose";
import { ApiError } from "../exceptions/ApiError.js";
import { NotFoundException } from "../exceptions/NotFound.error.js";
import type {
  CreateAgentRequest,
  PatchAgentRequest,
} from "../dto/request/AgentRequest.dto.js";
import { AgentRepository } from "../repository/Agent.repository.js";

const allowedFields = new Set([
  "name",
  "knowledgeBase",
  "instructions",
  "tools",
  "isActive",
]);

export class AgentService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async getAgents(ownerId: Types.ObjectId) {
    const agents = await this.agentRepository.findByOwner(ownerId);
    return agents.map((agent) => ({
      agentId: agent._id.toString(),
      name: agent.name,
      knowledgeBase: agent.knowledgeBase,
    }));
  }

  async getAgentById(ownerId: Types.ObjectId, agentId: string) {
    if (!Types.ObjectId.isValid(agentId)) {
      throw new ApiError(400, "Invalid agent ID");
    }

    const agent = await this.agentRepository.findById(ownerId, agentId);
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }

    return agent;
  }

  async createAgent(ownerId: Types.ObjectId, agent: CreateAgentRequest) {
    if (!agent || typeof agent !== "object" || Array.isArray(agent)) {
      throw new ApiError(400, "Agent data must be an object");
    }
    if (Object.keys(agent).some((field) => !allowedFields.has(field))) {
      throw new ApiError(400, "Agent data contains unsupported fields");
    }

    this.validateAgentFields(agent, true);
    return this.agentRepository.create(ownerId, agent);
  }

  async patchAgent(
    ownerId: Types.ObjectId,
    agentId: string,
    updates: PatchAgentRequest,
  ) {
    if (!Types.ObjectId.isValid(agentId)) {
      throw new ApiError(400, "Invalid agent ID");
    }

    if (
      !updates ||
      typeof updates !== "object" ||
      Object.keys(updates).length === 0 ||
      Object.keys(updates).some((field) => !allowedFields.has(field))
    ) {
      throw new ApiError(400, "At least one valid agent field is required");
    }

    this.validateAgentFields(updates, false);

    const agent = await this.agentRepository.update(ownerId, agentId, updates);
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }

    return agent;
  }

  private validateAgentFields(
    agent: CreateAgentRequest | PatchAgentRequest,
    requireAll: boolean,
  ): void {
    for (const field of ["name", "knowledgeBase", "instructions"] as const) {
      const value = agent[field];
      if (
        (requireAll || value !== undefined) &&
        (typeof value !== "string" || value.trim().length === 0)
      ) {
        throw new ApiError(400, `${field} must be a non-empty string`);
      }
    }

    if (
      agent.tools !== undefined &&
      (!Array.isArray(agent.tools) ||
        !agent.tools.every((tool) => typeof tool === "string"))
    ) {
      throw new ApiError(400, "tools must be an array of strings");
    }

    if (agent.isActive !== undefined && typeof agent.isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
  }
}
