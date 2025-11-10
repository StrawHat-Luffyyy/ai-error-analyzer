import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoutes from "./routes/analyze.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import historyRoutes from "./routes/history.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { initSentry } from "./utils/logger.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import * as Sentry from "@sentry/node";

dotenv.config();

initSentry();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.get("/", (req, res) => {
  res.send("AI Error Analyzer API is running");
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/health", healthRoutes);

// Sentry error handler must be AFTER all routes and controllers
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

export default app;