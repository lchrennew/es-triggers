import { RedisURL } from "es-ioredis-url";

export const redis = new RedisURL(process.env.REDIS_URL).getRedis()
