import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/payments/razorpay/create-order
// Body: { order_id }
//
// Creates a Razorpay order for an existing pending_payment sales order and
// records it in shop_payments. When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are
// not configured, returns { stub: true } so the frontend can fall back
// gracefully — no code changes needed once keys are added.
export async function POST(req) {
  try {
    const { order_id } = await req.json();

    if (!UUID_RE.test(String(order_id || ""))) {
      return NextResponse.json(
        { ok: false, error: "Invalid order id." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({
        ok: true,
        stub: true,
        message: "Razorpay keys not configured yet.",
      });
    }

    const client = getSupabase();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Shop is not connected. Please try again later." },
        { status: 503 }
      );
    }

    // Load the order — amount always comes from the DB, never the client.
    const { data: order, error: orderErr } = await client
      .from("sales_orders")
      .select("id, total_amount, status, invoice_number, order_number")
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, error: "Order not found." },
        { status: 404 }
      );
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { ok: false, error: "This order is not awaiting payment." },
        { status: 400 }
      );
    }

    // Idempotency: reuse an existing created payment for this order.
    const { data: existing } = await client
      .from("shop_payments")
      .select("razorpay_order_id, amount, currency, status")
      .eq("order_id", order_id)
      .eq("status", "created")
      .maybeSingle();

    if (existing?.razorpay_order_id) {
      return NextResponse.json({
        ok: true,
        data: {
          razorpay_order_id: existing.razorpay_order_id,
          amount: Number(existing.amount),
          currency: existing.currency || "INR",
          key_id: keyId,
        },
      });
    }

    const amountPaise = Math.round(Number(order.total_amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return NextResponse.json(
        { ok: false, error: "Invalid order amount." },
        { status: 400 }
      );
    }

    // Create the order on Razorpay's API (Basic auth with key id/secret).
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: String(
          order.invoice_number || order.order_number || order_id
        ).slice(0, 40),
        notes: { xyvot_order_id: order_id },
      }),
    });

    const rzpData = await rzpRes.json();
    if (!rzpRes.ok || !rzpData?.id) {
      console.error("razorpay create-order failed:", rzpData);
      return NextResponse.json(
        { ok: false, error: "Payment could not be initiated. Please try again." },
        { status: 502 }
      );
    }

    const { error: payErr } = await client.from("shop_payments").insert({
      order_id,
      razorpay_order_id: rzpData.id,
      amount: Number(order.total_amount),
      currency: "INR",
      status: "created",
    });

    if (payErr) {
      console.error("shop_payments insert error:", payErr.message);
      // The Razorpay order exists; the verify step can recover via upsert.
    }

    return NextResponse.json({
      ok: true,
      data: {
        razorpay_order_id: rzpData.id,
        amount: Number(order.total_amount),
        currency: "INR",
        key_id: keyId,
      },
    });
  } catch (err) {
    console.error("razorpay/create-order error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Payment could not be initiated. Please try again." },
      { status: 500 }
    );
  }
}
