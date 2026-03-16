import { createClient } from "@supabase/supabase-js";
import { logger } from "../src/lib/logger";

const CTX = "verify-supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  logger.error(CTX, "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const TABLES = ["sessions", "tracking_events", "leads"] as const;

async function verify() {
  logger.info(CTX, "Starting Supabase connection verification");

  for (const table of TABLES) {
    logger.info(CTX, `Checking table "${table}"...`);
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      logger.error(CTX, `Table "${table}" check FAILED`, { error: error.message });
      process.exit(1);
    }
    logger.info(CTX, `Table "${table}" — OK`);
  }

  logger.info(CTX, "All tables verified successfully");
  process.exit(0);
}

verify();
