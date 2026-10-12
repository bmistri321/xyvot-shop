import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Shared helpers for the address book API.
export function cleanPhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(cleanPhone(phone));
}

export function noClient() {
  return NextResponse.json(
    { ok: false, error: "Shop is not connected. Please try again later." },
    { status: 503 }
  );
}

// GET /api/addresses?phone=9876543210 — list addresses, default first.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = cleanPhone(searchParams.get("phone"));
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number." },
        { status: 400 }
      );
    }

    const client = getSupabase();
    if (!client) return noClient();

    const { data, error } = await client
      .from("customer_addresses")
      .select("*")
      .eq("customer_phone", phone)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("addresses GET error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Could not load addresses." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err) {
    console.error("addresses GET error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not load addresses." },
      { status: 500 }
    );
  }
}

// POST /api/addresses — create an address.
// Body: { phone, label, recipient_name, phone2, address_line1, address_line2,
//         city, state, pincode, lat, lng, is_default }
export async function POST(req) {
  try {
    const body = await req.json();
    const phone = cleanPhone(body.phone);
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number." },
        { status: 400 }
      );
    }

    const address_line1 = String(body.address_line1 || "").trim();
    const city = String(body.city || "").trim();
    const pincode = String(body.pincode || "").trim();
    if (!address_line1 || !city || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { ok: false, error: "Address, city and a 6-digit pincode are required." },
        { status: 400 }
      );
    }

    const client = getSupabase();
    if (!client) return noClient();

    const isDefault = Boolean(body.is_default);

    // If this becomes the default, unset the flag on the customer's others.
    if (isDefault) {
      await client
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_phone", phone)
        .eq("is_default", true);
    }

    const row = {
      customer_phone: phone,
      label: String(body.label || "Home").trim().slice(0, 30),
      recipient_name: String(body.recipient_name || "").trim().slice(0, 80),
      phone: String(body.phone2 || phone).replace(/\D/g, "").slice(-10),
      address_line1,
      address_line2: String(body.address_line2 || "").trim().slice(0, 120),
      city: city.slice(0, 60),
      state: String(body.state || "").trim().slice(0, 60),
      pincode,
      lat: body.lat != null ? Number(body.lat) : null,
      lng: body.lng != null ? Number(body.lng) : null,
      is_default: isDefault,
    };

    const { data, error } = await client
      .from("customer_addresses")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("addresses POST error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Could not save the address." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("addresses POST error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not save the address." },
      { status: 500 }
    );
  }
}
