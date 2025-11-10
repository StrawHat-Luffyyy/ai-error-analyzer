import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const hasUpstashCreds = Boolean(redisUrl && redisToken);

// In-memory fallback with TTL support
const inMemoryStore = new Map();

function memoryGet(key) {
  const entry = inMemoryStore.get(key);
  if (!entry) return null;
  const { value, expiresAt } = entry;
  if (expiresAt && Date.now() > expiresAt) {
    inMemoryStore.delete(key);
    return null;
  }
  return value;
}

function memorySet(key, value, options = {}) {
  const { ex } = options || {}; // TTL in seconds
  const expiresAt = typeof ex === "number" ? Date.now() + ex * 1000 : undefined;
  inMemoryStore.set(key, { value, expiresAt });
}

let upstashClient = null;

// Proper initialization (no invalid URL errors)
if (hasUpstashCreds) {
  try {
    if (!redisUrl.startsWith("https://")) {
      throw new Error(`Invalid Upstash URL: ${redisUrl}`);
    }

    upstashClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    console.log("Upstash Redis initialized successfully");
  } catch (err) {
    console.warn(
      "Failed to initialize Upstash Redis. Using memory fallback.",
      err
    );
  }
} else {
  console.warn("Upstash credentials missing. Using in-memory cache fallback.");
}

// Unified redis interface with fallback
export const redis = {
  async get(key) {
    try {
      if (upstashClient) {
        const result = await upstashClient.get(key);
        return result;
      }
      return memoryGet(key);
    } catch (err) {
      console.warn("Redis GET failed, using fallback:", err.message);
      return memoryGet(key);
    }
  },

  async set(key, value, options) {
    try {
      if (upstashClient) {
        return await upstashClient.set(key, value, options);
      }
      memorySet(key, value, options);
      return "OK";
    } catch (err) {
      console.warn(
        "Redis SET failed, writing to memory fallback:",
        err.message
      );
      memorySet(key, value, options);
      return "OK";
    }
  },

  async ping() {
    try {
      if (upstashClient) {
        await upstashClient.ping();
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Redis ping failed:", err.message);
      return false;
    }
  },
};
