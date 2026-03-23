import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 200 }
      );
    }

    console.log("BODY:", body);

    const {
      session_id,
      node_id,
      action_type,
      choice_path,
      payload,
      timestamp,
    } = body;

    // 🚨 SAFE INSERT (NO CRASH)
    const { error, data } = await supabaseServer
      .from("tracking_events")
      .insert([
        {
          session_id: session_id || "temp-session",
          node_id: node_id || "unknown",
          action_type: action_type || "unknown",
          choice_path: choice_path || [],
          payload: payload || {},
          timestamp: timestamp || new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Database insert failed" },
        { status: 200 } // ⚠️ IMPORTANT: prevent frontend crash
      );
    }

    console.log("Supabase insert response data:", data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("API ERROR:", err);

    // ✅ ALWAYS RETURN JSON
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Server crashed",
      },
      { status: 200 } // ⚠️ prevent HTML response
    );
  }
}