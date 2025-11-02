import ErrorLog from "../models/error.model.js";

export const getMetrics = async (req, res) => {
  try {
    const totalErrors = await ErrorLog.countDocuments();

    const avgResponseTime = await ErrorLog.aggregate([
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: "$responseTime",
          },
        },
      },
    ]);
    const topKeywords = await ErrorLog.aggregate([
      { $project: { words: { $split: ["$input", " "] } } },
      { $unwind: "$words" },
      { $group: { _id: "$words", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const recentActivity = await ErrorLog.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .select("createdAt input");

    res.json({
      totalErrors,
      avgResponseTime: avgResponseTime[0]?.avgTime?.toFixed(2) || "No data yet",
      topKeywords: topKeywords.map((k) => k._id),
      recentActivity,
    });
  } catch (error) {
    onsole.error("Metrics error:", error);
    res.status(500).json({ message: "Error fetching metrics" });
  }
};
