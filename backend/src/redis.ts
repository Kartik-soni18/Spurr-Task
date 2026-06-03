import { createClient, type RedisClientType } from "redis";
import { config } from "./config.js";

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!config.REDIS_URL) return null;
  if (redisClient?.isReady) return redisClient;

  try {
    redisClient = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err.message);
    });

    await redisClient.connect();
    console.log("Redis connected");
    return redisClient;
  } catch (err) {
    console.error("Redis connection failed, continuing without cache/rate-limit:", err);
    redisClient = null;
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient?.isReady) {
    await redisClient.quit();
    redisClient = null;
  }
}
