// lib/logger.js — winston 구조화 로깅 (pc-site-backend utils/logger.js 이식)
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, errors, json } = format;

const isProduction = process.env.NODE_ENV === "production";

const devFormat = printf(({ timestamp, level, message, stack }) =>
  stack
    ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`
    : `${timestamp} [${level.toUpperCase()}] ${message}`
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    isProduction ? json() : devFormat
  ),
  transports: [new transports.Console()],
});

export default logger;
