// infrastructure/jobs/connection.js

import IORedis from "ioredis";
import { redisConfig } from "../../config/redis.js";

export const connection = new IORedis(redisConfig.url, {
    maxRetriesPerRequest: null,
});