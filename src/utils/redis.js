import { RedisURL } from "es-ioredis-url";

export const redis = new RedisURL().getRedis()
