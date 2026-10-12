import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client = null;
export function getSupabase() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes("your-")) {
    console.warn("Supabase not configured — returning null client");
    return null;
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

// Legacy export for compatibility — use getSupabase() in new code
export const supabase = null;

// Product fields safe for public storefront display
export const PRODUCT_FIELDS =
  "id, organization_id, title, name, description, category, price, selling_price, mrp, image_url, image, stock, stock_quantity, rating, badge, has_variants, variants, created_at";

// Fetch active products for the marketplace
export async function getProducts({ limit = 48, category = null, search = null, organizationId = null } = {}) {
  const client = getSupabase();
  if (!client) return [];
  let query = client
    .from("products")
    .select(PRODUCT_FIELDS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%`);
  }
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }
  return data || [];
}

// Fetch a single product by ID
export async function getProduct(id) {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProduct error:", error.message);
    return null;
  }
  return data;
}

// Fetch distinct categories
export async function getCategories() {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error || !data) return [];
  return [...new Set(data.map((p) => p.category).filter(Boolean))].sort();
}

// Fetch a single business by ID for the shop profile page.
// Tolerates databases missing the newer columns (logo_url, address, city,
// lat/lng) — falls back to the schema-confirmed minimal set.
export async function getShop(id) {
  const client = getSupabase();
  if (!client || !id) return null;

  const full = await client
    .from("organizations")
    .select("id, name, slug, logo_url, address, city, status, is_archived, owner_phone, owner_email")
    .eq("id", id)
    .eq("is_archived", false)
    .maybeSingle();

  let shop = null;
  if (full.error) {
    const minimal = await client
      .from("organizations")
      .select("id, name, slug, status, is_archived, owner_phone")
      .eq("id", id)
      .eq("is_archived", false)
      .maybeSingle();
    if (minimal.error || !minimal.data) return null;
    shop = minimal.data;
  } else {
    shop = full.data;
  }

  if (!shop || (shop.status && shop.status !== "active")) return null;
  return shop;
}

// Normalize price display
export function formatPrice(value) {
  const num = Number(value ?? 0);
  return `₹${num % 1 === 0 ? num.toLocaleString("en-IN") : num.toFixed(2)}`;
}

// Calculate discount percentage
export function discountPercent(product) {
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
