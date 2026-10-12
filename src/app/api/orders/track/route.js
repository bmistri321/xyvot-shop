import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cleanPhone, isValidPhone } from "../../addresses/route";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/orders/track?order_id=<uuid>&phone=<phone>
// Returns the order status timeline. The caller must supply the phone number
// the order was placed with (lightweight ownership check).
// delivery_pin is only exposed once the order is out_for_delivery — never
// before, so it can't be abused for early pickup claims.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id") || "";
    const phone = cleanPhone(searchParams.get("phone"));

    if (!UUID_RE.test(orderId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid order id." },
        { status: 400 }
      );
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number." },
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

    const { data: order, error } = await client
      .from("sales_orders")
      .select(
        "id, invoice_number, order_number, status, delivery_status, " +
          "total_amount, items, delivery_address, destination_address, " +
          "assigned_rider_id, delivery_pin, created_at, updated_at, " +
          "payment_method"
      )
      .eq("id", orderId)
      .eq("customer_phone", phone)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const outForDelivery = ["out_for_delivery", "picked_up", "arriving"].includes(
      String(order.delivery_status || "").toLowerCase()
    );

    // Best-effort rider lookup — the column may be empty or reference an
    // external rider id, so this never fails the request.
    let rider = null;
    if (order.assigned_rider_id) {
      rider = { id: order.assigned_rider_id };
    }

    return NextResponse.json({
      ok: true,
      data: {
        order_id: order.id,
        order_number: order.invoice_number || order.order_number,
        status: order.status,
        delivery_status: order.delivery_status,
        total_amount: Number(order.total_amount ?? 0),
        payment_method: order.payment_method,
        items: order.items || [],
        delivery_address: order.destination_address || order.delivery_address,
        rider,
        // Only reveal the PIN once the rider is on the way.
        delivery_pin: outForDelivery ? order.delivery_pin : null,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });
  } catch (err) {
    console.error("orders/track error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Could not load the order." },
      { status: 500 }
    );
  }
}
