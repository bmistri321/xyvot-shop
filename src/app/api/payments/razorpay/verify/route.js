import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getSupabase } from "@/lib/supabase";

// POST /api/payments/razorpay/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
//
// Verifies the Razorpay payment signature server-side with HMAC-SHA256.
// A payment is NEVER accepted on the client's word alone: without a valid
// signature the order stays pending_payment. On success the payment row is
// marked verified and the order is confirmed for dispatch.
//
// When RAZORPAY_KEY_SECRET is not configured, returns { stub: true }.
export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({
        ok: true,
        stub: true,
        message: "Razorpay keys not configured yet.",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !order_id
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing payment details." },
        { status: 400 }
      );
    }

    // Server-side signature check: HMAC-SHA256 of
    // "<razorpay_order_id>|<razorpay_payment_id>" keyed with the key secret.
    const expected = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== String(razorpay_signature)) {
      console.warn(
        "razorpay signature mismatch for order",
        razorpay_order_id
      );
      return NextResponse.json(
        { ok: false, error: "Payment verification failed." },
        { status: 400 }
      );
    }

    const client = getSupabase();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Shop is not connected. Please try again later." },
        { status: 503 }
      );
    }

    // Record the verified payment (upsert: the create step may have failed
    // to insert while Razorpay still created the order).
    const { error: payErr } = await client.from("shop_payments").upsert(
      {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: String(razorpay_signature),
        status: "verified",
        verified_at: new Date().toISOString(),
      },
      { onConflict: "razorpay_order_id" }
    );

    if (payErr) {
      console.error("shop_payments verify upsert error:", payErr.message);
      return NextResponse.json(
        { ok: false, error: "Could not record the payment." },
        { status: 500 }
      );
    }

    // Confirm the order for dispatch.
    const { error: orderErr } = await client
      .from("sales_orders")
      .update({ status: "confirmed" })
      .eq("id", order_id)
      .eq("status", "pending_payment");

    if (orderErr) {
      console.error("order confirm error:", orderErr.message);
    }

    return NextResponse.json({
      ok: true,
      data: { order_id, status: "confirmed" },
    });
  } catch (err) {
    console.error("razorpay/verify error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
