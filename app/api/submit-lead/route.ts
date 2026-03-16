import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { logger } from "@/src/lib/logger";

const CTX = "API:submit-lead";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  logger.info(CTX, "POST /api/submit-lead — request received");

  try {
    const body = await request.json();
    const { session_id, data } = body;
    logger.debug(CTX, "Parsed request body", {
      session_id,
      dataKeys: data ? Object.keys(data) : null,
    });

    if (!session_id || !UUID_RE.test(session_id)) {
      logger.warn(CTX, "Validation failed: invalid or missing session_id", { session_id });
      return NextResponse.json(
        { error: "Invalid or missing session_id" },
        { status: 400 }
      );
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      logger.warn(CTX, "Validation failed: invalid or missing data", { data });
      return NextResponse.json(
        { error: "Invalid or missing data" },
        { status: 400 }
      );
    }

    logger.info(CTX, "Inserting lead into Supabase", { session_id });
    const { data: lead, error } = await supabaseServer
      .from("leads")
      .insert({ session_id, data })
      .select("id")
      .single();

    if (error) {
      logger.error(CTX, "Supabase insert failed", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info(CTX, "Lead submitted successfully", { session_id, lead_id: lead.id });
    return NextResponse.json({ lead_id: lead.id }, { status: 201 });
  } catch (err) {
    logger.error(CTX, "Unhandled exception in POST /api/submit-lead", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
