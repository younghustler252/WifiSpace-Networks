import Redis from "ioredis";
import { redisConfig } from "./redis.js";

// Create Redis client using URL (for cloud Redis)
export const redisClient = new Redis(redisConfig.url, {
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));

export default redisClient;