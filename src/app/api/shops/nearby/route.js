import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/shops/nearby?lat=..&lng=..&city=..&limit=12
// Returns active businesses sorted by proximity, limited to an 8 km radius.
//
// Distance strategy:
//  - If the caller passes lat/lng AND a business has coordinates, we compute
//    Haversine distance server-side, EXCLUDE businesses farther than 8 km
//    (MAX_RADIUS_KM), and sort the survivors nearest-first.
//  - Businesses without coordinates (or calls without lat/lng) fall back to
//    city matching: same city first, then the rest. distance_km is null there
//    and no radius filter can be applied (there is no reference point).
//
// Column strategy:
//  lat/lng/is_active/logo_url may not exist on every database yet, so we try
//  the full column set first and fall back to the schema-confirmed minimal
//  set on error. Either way the response shape is identical.

const FULL_COLUMNS =
  "id, name, slug, logo_url, address, city, lat, lng, status, is_active, is_archived, owner_phone";
const MINIMAL_COLUMNS = "id, name, slug, status, is_archived, owner_phone";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

// Only businesses within this radius of the caller count as "near".
const MAX_RADIUS_KM = 8;

/** Great-circle distance in km between two lat/lng points. */
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** A business counts as active unless explicitly marked otherwise. */
function isActiveBusiness(org) {
  if (org.is_archived) return false;
  if (org.status && org.status !== "active") return false;
  if (org.is_active === false) return false;
  return true;
}

function toShopCard(org, distanceKm) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug || null,
    logo_url: org.logo_url || null,
    city: org.city || null,
    address: org.address || null,
    phone: org.owner_phone || null,
    distance_km:
      distanceKm === null || distanceKm === undefined
        ? null
        : Math.round(distanceKm * 10) / 10,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const city = (searchParams.get("city") || "").trim().toLowerCase();
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit"), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ ok: true, data: [] });
    }

    // Fetch businesses; tolerate databases that lack the newer columns.
    let orgs = null;
    const full = await client
      .from("organizations")
      .select(FULL_COLUMNS)
      .eq("is_archived", false)
      .limit(200);
    if (full.error) {
      const minimal = await client
        .from("organizations")
        .select(MINIMAL_COLUMNS)
        .eq("is_archived", false)
        .limit(200);
      if (minimal.error) {
        console.error("shops/nearby error:", minimal.error.message);
        return NextResponse.json(
          { ok: false, error: "Could not load nearby shops." },
          { status: 500 }
        );
      }
      orgs = minimal.data || [];
    } else {
      orgs = full.data || [];
    }

    const active = orgs.filter(isActiveBusiness);

    // Attach distances where both sides have coordinates.
    // Radius rule: with a caller position, businesses beyond 8 km are
    // excluded entirely. Businesses without coordinates keep distanceKm null
    // (no reference point to measure from) and pass through unaffected.
    const withDistance = active
      .map((org) => {
        const olat = parseFloat(org.lat);
        const olng = parseFloat(org.lng);
        const distanceKm =
          hasCoords && Number.isFinite(olat) && Number.isFinite(olng)
            ? haversineKm(lat, lng, olat, olng)
            : null;
        return { org, distanceKm };
      })
      .filter(
        ({ distanceKm }) => distanceKm === null || distanceKm <= MAX_RADIUS_KM
      );

    // Sort: nearest first (known distances), then city matches, then rest.
    // Businesses with unknown distance always sort after known ones.
    withDistance.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      if (city) {
        const aMatch = (a.org.city || "").toLowerCase() === city ? 0 : 1;
        const bMatch = (b.org.city || "").toLowerCase() === city ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
      }
      return (a.org.name || "").localeCompare(b.org.name || "");
    });

    const data = withDistance
      .slice(0, limit)
      .map(({ org, distanceKm }) => toShopCard(org, distanceKm));

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("shops/nearby error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not load nearby shops." },
      { status: 500 }
    );
  }
}
