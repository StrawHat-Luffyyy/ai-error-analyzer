import { geminiModel } from "../config/gemini.js";
import ErrorLog from "../models/error.model.js";

export const analyzeError = async (req, res) => {
  const { error } = req.body;
  if (!error)
    return res.status(400).json({ message: "Error message required." });

  const start = Date.now();

  try {
    const prompt = `
      You are an expert software engineer. Analyze the following error 
      and return a valid JSON object with exactly these keys: 
      "summary", "rootCause", and "suggestedFix".
      The output must be strictly valid JSON — no code blocks, no markdown, no explanations.
      
      Error:
      ${error}
    `;

    //Pass the prompt string directly
    const result = await geminiModel.generateContent(prompt);

    const response = result.response;
    let text = response.text().trim();

    //Clean up unwanted markdown
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    //Parse JSON safely
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseErr) {
      console.warn("Raw response not valid JSON. Attempting cleanup...");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch {
          parsedResponse = {
            summary: text,
            rootCause: "Parsing failed",
            suggestedFix: "Recheck output format.",
          };
        }
      } else {
        parsedResponse = {
          summary: text,
          rootCause: "AI output not in JSON",
          suggestedFix: "Manually interpret message.",
        };
      }
    }

    const responseTime = Date.now() - start;

    const saved = await ErrorLog.create({
      input: error,
      analysis: parsedResponse,
      responseTime,
    });

    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ success: false, message: "AI analysis failed." });
  }
};
