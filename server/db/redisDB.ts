import { createClient } from "redis";
// importing logger
import Logger from "../lib/logger";

require("dotenv").config();

const client = createClient({
  host: process.env.REDIS_HOSTNAME,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  password: process.env.REDIS_PASSWORD,

  enable_offline_queue: false,
});

client
  .on("connect", () => {
    Logger.info("Connected to the Redis database successfully.");
  })
  // handle connection errors
  .on("error", (err: any) => {
    Logger.error(err);
    return new Error();
  });
export default client;
