import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoutes from "./routes/analyze.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger); 

app.use("/api", analyzeRoutes);
app.use("/api/metrics", metricsRoutes);

app.get("/", (req, res) => {
  res.send("AI Error Analyzer API is running ");
});

export default app;
