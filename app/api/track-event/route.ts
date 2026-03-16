import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { logger } from "@/src/lib/logger";

const CTX = "API:track-event";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  logger.info(CTX, "POST /api/track-event — request received");

  try {
    const body = await request.json();
    const { session_id, node_id, choice_path } = body;
    logger.debug(CTX, "Parsed request body", { session_id, node_id, choice_path });

    if (!session_id || !UUID_RE.test(session_id)) {
      logger.warn(CTX, "Validation failed: invalid or missing session_id", { session_id });
      return NextResponse.json(
        { error: "Invalid or missing session_id" },
        { status: 400 }
      );
    }
    if (!node_id || typeof node_id !== "string") {
      logger.warn(CTX, "Validation failed: invalid or missing node_id", { node_id });
      return NextResponse.json(
        { error: "Invalid or missing node_id" },
        { status: 400 }
      );
    }

    logger.info(CTX, "Inserting tracking event into Supabase", { session_id, node_id });
    const { error } = await supabaseServer.from("tracking_events").insert({
      session_id,
      node_id,
      choice_path: choice_path ?? [],
    });

    if (error) {
      logger.error(CTX, "Supabase insert failed", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info(CTX, "Tracking event recorded successfully", { session_id, node_id });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    logger.error(CTX, "Unhandled exception in POST /api/track-event", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
