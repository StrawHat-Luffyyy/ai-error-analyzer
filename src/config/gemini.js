import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-2.5-flash (recommended) or gemini-2.0-flash
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash" 
});