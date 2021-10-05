import winston from "winston";

// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Show all the log levels
// if the server was run in development mode
// Otherwise, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Linking colors to winston
winston.addColors(colors);

// setting the log format
const format = winston.format.combine(
  // Adding timestamp
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
  // logs must be colored
  winston.format.colorize({ all: true }),
  // Defining format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Defining which transports the logger must use to print out messages.
const transports = [
  // Writing error messages in console
  new winston.transports.Console(),
  // Writing all the error messages in error.log file inside logs folder
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  // Writing all the logs in all.log file inside logs folder
  new winston.transports.File({ filename: "logs/all.log" }),
];

// Creating the logger instance that will be exported to log messages.
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
