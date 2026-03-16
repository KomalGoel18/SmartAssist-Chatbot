/**
 * Client-side structured logger.
 * Outputs to the browser console with timestamps and context tags.
 * These logs are visible in browser DevTools.
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function formatPrefix(level: LogLevel, context: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] [${context}]`;
}

export const clientLogger = {
  info: (context: string, message: string, data?: unknown) => {
    if (data !== undefined) {
      console.log(formatPrefix("INFO", context), message, data);
    } else {
      console.log(formatPrefix("INFO", context), message);
    }
  },

  warn: (context: string, message: string, data?: unknown) => {
    if (data !== undefined) {
      console.warn(formatPrefix("WARN", context), message, data);
    } else {
      console.warn(formatPrefix("WARN", context), message);
    }
  },

  error: (context: string, message: string, data?: unknown) => {
    if (data !== undefined) {
      console.error(formatPrefix("ERROR", context), message, data);
    } else {
      console.error(formatPrefix("ERROR", context), message);
    }
  },

  debug: (context: string, message: string, data?: unknown) => {
    if (data !== undefined) {
      console.debug(formatPrefix("DEBUG", context), message, data);
    } else {
      console.debug(formatPrefix("DEBUG", context), message);
    }
  },
};
