import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL as string,
});

//@ts-ignore
await redis.connect();

export const redisClient = redis;
export default redis;