import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cleanPhone, isValidPhone, noClient } from "../route";

// PUT /api/addresses/[id] — update an address. Body may include any address
// field plus `phone` (owner) for scoping. Setting is_default unsets others.
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const phone = cleanPhone(body.phone);
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number." },
        { status: 400 }
      );
    }

    const client = getSupabase();
    if (!client) return noClient();

    // Confirm the address belongs to this customer.
    const { data: existing } = await client
      .from("customer_addresses")
      .select("id")
      .eq("id", id)
      .eq("customer_phone", phone)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Address not found." },
        { status: 404 }
      );
    }

    const patch = {};
    for (const key of [
      "label",
      "recipient_name",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "pincode",
    ]) {
      if (body[key] !== undefined) patch[key] = String(body[key]).trim();
    }
    if (body.phone2 !== undefined)
      patch.phone = String(body.phone2).replace(/\D/g, "").slice(-10);
    if (body.lat !== undefined) patch.lat = body.lat == null ? null : Number(body.lat);
    if (body.lng !== undefined) patch.lng = body.lng == null ? null : Number(body.lng);
    if (body.is_default !== undefined) patch.is_default = Boolean(body.is_default);

    if (patch.pincode && !/^\d{6}$/.test(patch.pincode)) {
      return NextResponse.json(
        { ok: false, error: "Pincode must be 6 digits." },
        { status: 400 }
      );
    }

    if (patch.is_default) {
      await client
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_phone", phone)
        .eq("is_default", true)
        .neq("id", id);
    }

    const { data, error } = await client
      .from("customer_addresses")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("addresses PUT error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Could not update the address." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("addresses PUT error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not update the address." },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id]?phone=9876543210 — delete an address.
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
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

    const { error } = await client
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .eq("customer_phone", phone);

    if (error) {
      console.error("addresses DELETE error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Could not delete the address." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (err) {
    console.error("addresses DELETE error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not delete the address." },
      { status: 500 }
    );
  }
}
