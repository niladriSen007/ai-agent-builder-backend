export interface CreateAgentRequest {
  name: string;
  knowledgeBase: string;
  instructions: string;
  tools?: string[];
  isActive?: boolean;
}

export type PatchAgentRequest = Partial<CreateAgentRequest>;
