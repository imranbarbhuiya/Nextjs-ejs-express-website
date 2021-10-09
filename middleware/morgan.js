import morgan from "morgan";
import Logger from "../lib/logger.js";

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = (morgan.StreamOptions = {
  // Use the http severity
  write: (message) => Logger.http(message),
});

// Skip all the Morgan http log in production mode
// else show it in development mode.
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

// Defining morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  ":method :url :status :res[content-length] - :response-time ms",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

export default morganMiddleware;
