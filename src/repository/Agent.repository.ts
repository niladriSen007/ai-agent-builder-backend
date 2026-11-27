import { AgentEntity, type AgentEntityDocument } from "../entity/Agent.model.js";
import type { Types } from "mongoose";
import type {
  CreateAgentRequest,
  PatchAgentRequest,
} from "../dto/request/AgentRequest.dto.js";

export class AgentRepository {
  async findByOwner(ownerId: Types.ObjectId): Promise<AgentEntityDocument[]> {
    return AgentEntity.find({ ownerId })
      .select("_id name knowledgeBase")
      .sort({ createdAt: -1 });
  }

  async findById(
    ownerId: Types.ObjectId,
    agentId: string,
  ): Promise<AgentEntityDocument | null> {
    return AgentEntity.findOne({ _id: agentId, ownerId });
  }

  async create(
    ownerId: Types.ObjectId,
    agent: CreateAgentRequest,
  ): Promise<AgentEntityDocument> {
    return AgentEntity.create({ ...agent, ownerId });
  }

  async update(
    ownerId: Types.ObjectId,
    agentId: string,
    updates: PatchAgentRequest,
  ): Promise<AgentEntityDocument | null> {
    return AgentEntity.findOneAndUpdate(
      { _id: agentId, ownerId },
      { $set: updates },
      { new: true, runValidators: true },
    );
  }
}
