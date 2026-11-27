import { PORT } from "./config/variables.js";
import connectDB from "./config/dbConnection.js";
import { app } from "./app.js";
import { initializeChatCheckpointer } from "./ai_chat_utils/Chat.graph.js";

const startServer = async () => {
  await connectDB();
  await initializeChatCheckpointer();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exitCode = 1;
});
