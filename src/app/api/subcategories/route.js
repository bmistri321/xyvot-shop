import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/subcategories?parent=Food%20%26%20beverages
// Returns active subcategories for a parent category, ordered by sort_order.
// Returns [] when the parent has no subcategories (they are optional).
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parent = (searchParams.get("parent") || "").trim();
    if (!parent) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const { data, error } = await client
      .from("shop_subcategories")
      .select("id, parent_category, name, slug, sort_order")
      .eq("parent_category", parent)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("subcategories error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Could not load subcategories." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err) {
    console.error("subcategories error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not load subcategories." },
      { status: 500 }
    );
  }
}
