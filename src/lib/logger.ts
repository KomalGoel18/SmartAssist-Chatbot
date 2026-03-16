import fs from "fs";
import path from "path";

// ── Log directory & file setup ──────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), "logs");

// Create a new log file each time the server starts (module first-load)
const startTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_FILE = path.join(LOG_DIR, `server-${startTimestamp}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Write a header line so we know when this run started
fs.appendFileSync(
  LOG_FILE,
  `===== Server started at ${new Date().toISOString()} =====\n\n`
);

// ── Types ───────────────────────────────────────────────────────────
type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// ── Formatting ──────────────────────────────────────────────────────
function formatLine(
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown
): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.padEnd(5)}] [${context}] ${message}`;
  if (data !== undefined) {
    return `${base} | ${JSON.stringify(data)}\n`;
  }
  return `${base}\n`;
}

// ── Write helper ────────────────────────────────────────────────────
function write(
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown
) {
  const line = formatLine(level, context, message, data);
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // If file write fails, at least we still have console output
  }
  // Mirror to console so logs show in terminal during dev
  const consoleFn =
    level === "ERROR"
      ? console.error
      : level === "WARN"
        ? console.warn
        : console.log;
  consoleFn(line.trimEnd());
}

// ── Public API ──────────────────────────────────────────────────────
export const logger = {
  info: (context: string, message: string, data?: unknown) =>
    write("INFO", context, message, data),

  warn: (context: string, message: string, data?: unknown) =>
    write("WARN", context, message, data),

  error: (context: string, message: string, data?: unknown) =>
    write("ERROR", context, message, data),

  debug: (context: string, message: string, data?: unknown) =>
    write("DEBUG", context, message, data),

  /** Returns the path to the current log file (useful for diagnostics). */
  getLogFilePath: () => LOG_FILE,
};
