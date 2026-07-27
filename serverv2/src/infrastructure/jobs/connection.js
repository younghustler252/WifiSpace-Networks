// infrastructure/queue/connection.js

import IORedis from "ioredis";
import { redisConfig } from "../../config/redis.js";

export const connection = new IORedis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    maxRetriesPerRequest: null,
});
