import { config } from "dotenv";
import { createClient } from "redis";
// importing logger
import Logger from "../lib/logger.js";

config();

const redisClient = createClient({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,

  enable_offline_queue: false,
});

redisClient
  .on("connect", function () {
    Logger.debug("Connected to the Redis database successfully.");
  })
  // handle connection errors
  .on("error", (err) => {
    Logger.error(err);
    return new Error();
  });
export default redisClient;
