import dotenv from "dotenv";
import passport from "passport";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "redis";
dotenv.config();

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByEmailAndIP = 10;

// the rate limiter instance counts and limits the number of failed logins by key
// const limiterSlowBruteByIP = new RateLimiterMongo({
const redisClient = redis.createClient({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,

  // enable_offline_queue: false,
});

redisClient
  .on("connect", function () {
    console.log("Connected to the Redis database successfully.");
  })

  // handle connection errors
  .on("error", (err) => {
    console.log(err);
    return new Error();
  });
const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "codversity_login_fail_ip_per_day",
  // maximum number of failed logins allowed. 1 fail = 1 point
  // each failed login consumes a point
  points: maxWrongAttemptsByIPperDay,
  // delete key after 24 hours
  duration: 60 * 60 * 24,
  // number of seconds to block route if consumed points > points
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByEmailAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "codversity_login_fail_consecutive_email_and_ip",
  points: maxConsecutiveFailsByEmailAndIP,
  duration: 60 * 60 * 24 * 14, // Store number for 14 days since first fail
  blockDuration: 60 * 60, // Block for 1 hour
});

// create key string
const getEmailIPkey = (email, ip) => `${email}_${ip}`;

// rate-limiting middleware controller
export async function loginRouteRateLimit(req, res, next) {
  const ipAddr = req.ip;
  const emailIPkey = getEmailIPkey(req.body.email, ipAddr);

  // get keys for attempted login
  const [resEmailAndIP, resSlowByIP] = await Promise.all([
    limiterConsecutiveFailsByEmailAndIP.get(emailIPkey),
    limiterSlowBruteByIP.get(ipAddr),
  ]);
  try {
    let retrySecs = 0;
    // Check if IP or email + IP is already blocked
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resEmailAndIP !== null &&
      resEmailAndIP.consumedPoints > maxConsecutiveFailsByEmailAndIP
    ) {
      retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
    }

    // the IP and email + ip are not rate limited
    if (retrySecs > 0) {
      // sets the response’s HTTP header field
      res.set("Retry-After", String(retrySecs));
      let remainingTime =
        retrySecs > 60
          ? `${(retrySecs / 60).toFixed(2)} minute`
          : `${retrySecs} seconds`;
      req.flash(
        "error",
        `Too many login attempts. Retry after ${remainingTime}`
      );
      return res.status(429).redirect("/login");
    }
  } catch (err) {
    return next(err);
  }
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Consume 1 point from limiters on wrong attempt and block if limits reached
      try {
        const promises = [limiterSlowBruteByIP.consume(ipAddr)];
        // check if user exists by checking if authentication failed because of an incorrect password
        if (info.name === "IncorrectPasswordError") {
          // Count failed attempts by Email + IP only for registered users
          promises.push(
            limiterConsecutiveFailsByEmailAndIP.consume(emailIPkey)
          );
        }
        await Promise.all(promises);
        req.flash("error", info.message);
        res.redirect("/login");
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected;
        } else {
          const timeOut =
            String(Math.round(rlRejected.msBeforeNext / 1000)) || 1;
          res.set("Retry-After", timeOut);
          let remainingTime =
            timeOut > 60
              ? `${(timeOut / 60).toFixed(2)} minute`
              : `${timeOut} seconds`;
          req.flash(
            "error",
            `Too many login attempts. Retry after ${remainingTime} seconds`
          );
          res.status(429).redirect("/login");
        }
      }
    }
    // If passport authentication successful
    if (user) {
      if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
        // Reset limiter based on IP + email on successful authorization
        await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);
      }
      // login (Passport.js method)
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        user.verified
          ? res.redirect(req.session.returnTo || "/")
          : res.redirect("/verify");
        delete req.session.returnTo;
        return;
      });
    }
  })(req, res, next);
}