import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const hasUpstashCreds = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// In-memory fallback with simple TTL support
const inMemoryStore = new Map();

function memoryGet(key) {
  const entry = inMemoryStore.get(key);
  if (!entry) return null;
  const { value, expiresAt } = entry;
  if (typeof expiresAt === "number" && Date.now() > expiresAt) {
    inMemoryStore.delete(key);
    return null;
  }
  return value;
}

function memorySet(key, value, options = {}) {
  const { ex } = options || {}; // seconds
  const expiresAt = typeof ex === "number" ? Date.now() + ex * 1000 : undefined;
  inMemoryStore.set(key, { value, expiresAt });
}

let upstashClient = null;
if (hasUpstashCreds) {
  try {
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis client. Falling back to memory.", err);
    upstashClient = null;
  }
} else {
  console.warn("Upstash credentials missing. Using in-memory cache fallback.");
}

// Resilient wrapper that won't throw
export const redis = {
  async get(key) {
    try {
      if (upstashClient) {
        return await upstashClient.get(key);
      }
      return memoryGet(key);
    } catch (err) {
      console.warn("Redis GET failed. Falling back to memory.", err);
      return memoryGet(key);
    }
  },

  async set(key, value, options) {
    try {
      if (upstashClient) {
        // Upstash supports { ex: seconds }
        return await upstashClient.set(key, value, options);
      }
      memorySet(key, value, options);
      return "OK";
    } catch (err) {
      console.warn("Redis SET failed. Writing to memory fallback.", err);
      memorySet(key, value, options);
      return "OK";
    }
  },
};
