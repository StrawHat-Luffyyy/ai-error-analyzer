import ErrorLog from "../models/error.model.js";

export const getMetrics = async (req, res) => {
  try {
    const totalErrors = await ErrorLog.countDocuments();

    const avgResponse = await ErrorLog.aggregate([
      { $group: { _id: null, avgTime: { $avg: "$responseTime" } } },
    ]);
    const avgResponseTime =
      avgResponse[0]?.avgTime?.toFixed(2) || "No data yet";

    //extract top error types
    const topErrorTypes = await ErrorLog.aggregate([
      {
        $project: {
          type: {
            $trim: {
              input: {
                $arrayElemAt: [{ $split: ["$input", ":"] }, 0],
              },
            },
          },
        },
      },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
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

    res.status(200).json({
      totalErrors,
      avgResponseTime,
      topErrorTypes,
      topKeywords: topKeywords.map((k) => k._id),
      recentActivity,
    });
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({ message: "Error fetching metrics" });
  }
};
