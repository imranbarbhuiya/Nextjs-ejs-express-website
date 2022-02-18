import rateLimit from "express-rate-limit";
import rateLimiterRedisStore from "rate-limit-redis";
import client from "../db/redisDB";

const authLimiter = rateLimit({
  store: new rateLimiterRedisStore({
    sendCommand: async (...args: string[]) => client.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again later", // response message
});

const apiLimiter = rateLimit({
  store: new rateLimiterRedisStore({
    sendCommand: async (...args: string[]) => client.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after few minutes", // response message
});

export { authLimiter, apiLimiter };
