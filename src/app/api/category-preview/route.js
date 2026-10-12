import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase";

// GET /api/category-preview?name=Food%20%26%20beverages
// Returns up to 8 products for the inline category expansion panel.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("name") || "";
  if (!category) {
    return NextResponse.json({ products: [] });
  }
  const products = await getProducts({ category, limit: 8 });
  return NextResponse.json({ products });
}
