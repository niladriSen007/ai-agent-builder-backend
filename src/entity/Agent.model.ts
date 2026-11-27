import {
  model,
  Schema,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const agentSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    knowledgeBase: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    tools: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const AgentEntity = model("Agent", agentSchema);
export type AgentEntityDocument = HydratedDocument<
  InferSchemaType<typeof agentSchema>
>;
