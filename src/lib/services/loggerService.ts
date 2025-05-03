type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export class LoggerService {
  private static instance: LoggerService;

  private constructor() {
    /* Singleton pattern - private constructor */
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private log(entry: LogEntry): void {
    // In development, log to console
    // In production, this could be extended to log to a service
    const logFn = entry.level === "error" ? console.error : console.log;

    logFn(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.context || "");
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry("warn", message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry("error", message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      this.log(this.createLogEntry("debug", message, context));
    }
  }
}

export const logger = LoggerService.getInstance();
