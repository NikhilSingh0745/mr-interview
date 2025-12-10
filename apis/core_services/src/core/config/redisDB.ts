import redis from "redis";
import { config } from "./config";

let redisClient;

const connectToRedis = async () => {
  try {
    console.log("Connecting to redis!");
    redisClient = redis.createClient({
      url: config.get("redisConnection"),
    });

    redisClient.on("error", (error: Error) => {
      throw new Error(error.message);
    });

    await redisClient.connect().then(() => {
      console.log("redis connected successfully!");
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

connectToRedis();

export default redisClient;
