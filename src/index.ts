import express from "express";
import { PORT } from "./config/variables.js";
import connectDB from "./config/dbConnection.js";
import { app } from "./app.js";

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
