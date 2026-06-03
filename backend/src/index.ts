import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config.js";

const app = express();

app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use("/api/chat", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
