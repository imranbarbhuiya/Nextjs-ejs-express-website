import rateLimit from "express-rate-limit";
import rateLimiterRedisStore from "rate-limit-redis";
import redisClient from "../db/redisDB";

const apiLimiter = rateLimit({
  store: new rateLimiterRedisStore({
    client: redisClient,
  }),
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour", // response message
});

export default apiLimiter;
