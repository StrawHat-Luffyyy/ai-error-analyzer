import mongoose from "mongoose";
import * as Sentry from "@sentry/node";
import { redis } from "../config/redis.js";

export const getSystemHealth = async (req, res) => {
  try {
    const mongoStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    let redisStatus = "Disconnected";
    try {
      await redis.ping();
      redisStatus = "Connected";
    } catch {
      redisStatus = "Failed";
    }
    const sentryStatus = Sentry.isInitialized()? "Configured": "Not Configured";
    const geminiStatus = process.env.GEMINI_API_KEY ? "Ready" : "Missing key";
    res.json({
      status: "ok",
      services: {
        MongoDB: mongoStatus,
        Redis: redisStatus,
        Sentry: sentryStatus,
        Gemini: geminiStatus,
      },
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
};
