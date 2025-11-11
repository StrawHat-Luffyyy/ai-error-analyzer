import { redis } from "../config/redis.js"

let cacheStats = {
  hits : 0 , 
  misses : 0,
  avgLatency : 0 ,
  totalOps: 0,
}

// Helper to track Redis performance
export const trackCacheUsage = async (type , latency) => {
cacheStats.totalOps += 1;
cacheStats.avgLatency = (cacheStats.avgLatency * (cacheStats.totalOps - 1) + latency) / cacheStats.totalOps

if (type === 'hit') cacheStats.hits += 1 
else if (type === "miss") cacheStats.misses += 1;
}

// Endpoint to fetch metrics
export const getCacheStats = async (req , res) => {
  try {
    res.json({
      cacheHits: cacheStats.hits,
      cacheMisses: cacheStats.misses,
      avgCacheLatency: Number(cacheStats.avgLatency.toFixed(2)),
      totalRequests: cacheStats.totalOps,
    })
  } catch (error) {
    console.error("Cache metrics fetch failed:", error);
    res.status(500).json({ message: "Failed to fetch cache stats" });
  }
}