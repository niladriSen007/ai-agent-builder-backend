import { ChatGroq } from "@langchain/groq";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { MONGO_URI } from "../config/variables.js";

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

const mongoClient = new MongoClient(MONGO_URI);
const checkpointer = new MongoDBSaver({
  client: mongoClient,
  dbName: "langgraph",
});

export const initializeChatCheckpointer = async (): Promise<void> => {
  const errors = await checkpointer.setup();
  if (errors.length > 0) {
    throw new Error(
      `MongoDB checkpointer setup failed: ${errors.map((error) => error.message).join("; ")}`,
    );
  }
};

const chatNode = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state?.messages);
  return {
    messages: [response],
  };
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", END);

export const graphWorkflow = graph.compile({ checkpointer });
