import Redis from "ioredis";
import { redisConfig } from "../../config/redis.js";

export const redisClient = new Redis({
	host: redisConfig.host,
	port: redisConfig.port,
	password: redisConfig.password,
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));