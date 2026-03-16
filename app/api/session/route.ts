import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { logger } from "@/src/lib/logger";

const CTX = "API:session";

export async function POST(request: Request) {
  logger.info(CTX, "POST /api/session — request received");

  try {
    const body = await request.json().catch(() => ({}));
    const metadata = body.metadata ?? {};
    logger.debug(CTX, "Parsed request body", { metadata });

    logger.info(CTX, "Inserting new session into Supabase");
    const { data, error } = await supabaseServer
      .from("sessions")
      .insert({ metadata })
      .select("id")
      .single();

    if (error) {
      logger.error(CTX, "Supabase insert failed", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info(CTX, "Session created successfully", { session_id: data.id });
    return NextResponse.json({ session_id: data.id }, { status: 201 });
  } catch (err) {
    logger.error(CTX, "Unhandled exception in POST /api/session", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
