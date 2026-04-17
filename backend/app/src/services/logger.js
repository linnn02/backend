import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format for console
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  )
);

// JSON format for file (structured / machine-readable)
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    // Console output (coloured)
    new winston.transports.Console({ format: consoleFormat }),

    // Rotating log file for all messages ≥ info
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/app.log"),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),

    // Separate file for errors only
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
});
