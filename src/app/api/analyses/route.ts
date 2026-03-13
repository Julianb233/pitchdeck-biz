import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("id, business_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/analyses] list error:", error.message);
      return NextResponse.json(
        { error: "Failed to load analyses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses: analyses ?? [],
    });
  } catch (error) {
    console.error("[api/analyses] error:", error);
    return NextResponse.json(
      { error: "Failed to load analyses" },
      { status: 500 }
    );
  }
}
