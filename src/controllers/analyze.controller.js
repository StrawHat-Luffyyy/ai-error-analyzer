import { redis } from "../config/redis.js";
import { geminiModel } from "../config/gemini.js";
import ErrorLog from "../models/error.model.js";
import { trackCacheUsage } from "./cache.controller.js";
import { performance } from "perf_hooks";

export const analyzeError = async (req, res) => {
  const { error } = req.body;
  if (!error)
    return res.status(400).json({ message: "Error message required." });

  const start = Date.now();

  try {
    let cached = null;
    try {
      const redisStart = performance.now();
      cached = await redis.get(error);
      const latency = performance.now() - redisStart;

      if (cached) {
        await trackCacheUsage("hit", latency);
        console.log("Served from cache");
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
        });
      } else {
        await trackCacheUsage("miss", latency);
      }
    } catch (cacheErr) {
      console.warn("Cache GET error (non-fatal):", cacheErr);
    }

    // Gemini AI call
    const prompt = `
      You are an expert software engineer. Analyze the following error 
      and return a valid JSON object with keys: "summary", "rootCause", "suggestedFix".
      Output strictly valid JSON.
      Error:
      ${error}
    `;

    const result = await geminiModel.generateContent(prompt);
    let text = result.response.text().trim();
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch {
      parsedResponse = {
        summary: text,
        rootCause: "Parsing failed",
        suggestedFix: "Recheck output format.",
      };
    }

    const responseTime = Date.now() - start;

    const saved = await ErrorLog.create({
      input: error,
      analysis: parsedResponse,
      responseTime,
      aiModel: "Gemini-2.5-flash",
    });

    //Cache result for 24 hours
    try {
      const redisStart = performance.now();
      await redis.set(error, JSON.stringify(saved), { ex: 86400 });
      const latency = performance.now() - redisStart;
      await trackCacheUsage("set", latency); //tracks cache store latency
    } catch (cacheErr) {
      console.warn("Cache SET error (non-fatal):", cacheErr);
    }

    res.status(200).json({ success: true, data: saved, cached: false });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(503).json({
      success: false,
      message:
        "AI service temporarily unavailable. Please try again in a few seconds.",
    });
  }
};
