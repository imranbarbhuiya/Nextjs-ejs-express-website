import {
  addColors,
  createLogger,
  format,
  LoggerOptions,
  transports,
} from "winston";

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};

// defining logger options
const loggerOptions: LoggerOptions = {
  // Define severity levels.
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },

  // define level
  level: level(),
  // Define log format.
  format: format.combine(
    // Show error stack
    format.errors({ stack: true }),
    // Add the message timestamp with the preferred format
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
    // log must be colored
    format.colorize({ all: true }),
    // Defining the format of the message showing the level, the timestamp, and the message
    format.printf(
      (info) =>
        `${info.level}  - ${info.timestamp} : ${info.message} ${
          info.stack || ""
        }`
    )
  ),

  // Define which transports the logger must use to print out messages.
  // We'll be using three different transports
  transports: [
    // Allow the use the console to print the messages
    new transports.Console(),
    // Allow to print all the error level messages inside the error.log file and delete them if file size becomes 10mb
    new transports.File({ filename: "logs/all.log" }),
    // Allow to print all the error message inside the all.log file
    // (also the error log that are also printed inside the error.log)
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
};

// Tell winston to add color
addColors(colors);

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = createLogger(loggerOptions);

export default Logger;
