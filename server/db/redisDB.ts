import { createClient } from "redis";

require("dotenv").config();

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: parseInt(process.env.REDIS_PORT as string, 10),
  },
  // legacyMode: true,
});
client.connect();

export default client;
