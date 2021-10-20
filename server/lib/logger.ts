import winston from "winston";
import "winston-daily-rotate-file";
// Define severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

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
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Tell winston to add color
winston.addColors(colors);

// Define log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
  // log must be colored
  winston.format.colorize({ all: true }),
  // Defining the format of the message showing the level, the timestamp, and the message
  winston.format.printf(
    (info) => `${info.level}  - ${info.timestamp} : ${info.message}`
  )
);

// Define which transports the logger must use to print out messages.
// We'll be using three different transports
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file and delete them if file size becomes 10mb
  new winston.transports.DailyRotateFile({
    dirname: "logs",
    filename: "error-%DATE%",
    datePattern: "YYYY-MM-DD-HH",
    extension: ".log",
    maxSize: "10m",
    level: "error",
  }),
  // Allow to print all the error message inside the all.log file
  // (also the error log that are also printed inside the error.log)
  new winston.transports.DailyRotateFile({
    dirname: "logs",
    filename: "all-%DATE%",
    datePattern: "YYYY-MM-DD-HH",
    extension: ".log",
    maxSize: "10m",
  }),
];

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
