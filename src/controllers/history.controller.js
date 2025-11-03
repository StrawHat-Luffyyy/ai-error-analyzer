import ErrorLog from "../models/error.model.js";

export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const searchTerm = search.trim();
    const query = searchTerm
      ? {
          $or: [
            { input: { $regex: searchTerm, $options: "i" } },
            { "analysis.summary": { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};
    
    const total = await ErrorLog.countDocuments(query);
    const history = await ErrorLog.find(query)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    console.log("Query:", query);
    console.log("History:", history);

    res.json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      results: history,
    });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
