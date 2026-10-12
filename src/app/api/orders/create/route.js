import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { cleanPhone, isValidPhone } from "../../addresses/route";

// POST /api/orders/create
// Body: { phone, name?, address_id, items: [{ product_id, qty }],
//         payment_method: 'razorpay' | 'cod' }
//
// Server-side flow: validates input, loads the delivery address, resolves the
// shop (organization) from the first product, then calls the atomic
// submit_marketplace_order_atomic RPC — which re-validates stock and computes
// all prices from the DB (client prices are never trusted). COD orders are
// marked 'confirmed'; Razorpay orders start as 'pending_payment' until the
// payment signature is verified.
export async function POST(req) {
  try {
    const body = await req.json();
    const phone = cleanPhone(body.phone);
    const paymentMethod = body.payment_method === "cod" ? "cod" : "razorpay";

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone number." },
        { status: 400 }
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { ok: false, error: "The cart is empty." },
        { status: 400 }
      );
    }

    for (const it of items) {
      if (!it.product_id || !Number.isFinite(Number(it.qty)) || Number(it.qty) < 1 || Number(it.qty) > 100) {
        return NextResponse.json(
          { ok: false, error: "Invalid cart items." },
          { status: 400 }
        );
      }
    }

    const client = getSupabase();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Shop is not connected. Please try again later." },
        { status: 503 }
      );
    }

    // Load the delivery address (must belong to this customer).
    const { data: address, error: addrErr } = await client
      .from("customer_addresses")
      .select("*")
      .eq("id", body.address_id)
      .eq("customer_phone", phone)
      .maybeSingle();

    if (addrErr || !address) {
      return NextResponse.json(
        { ok: false, error: "Please choose a delivery address." },
        { status: 400 }
      );
    }

    // Resolve the shop from the first product (single-shop carts for V1).
    const { data: firstProduct } = await client
      .from("products")
      .select("organization_id")
      .eq("id", items[0].product_id)
      .maybeSingle();

    const orgId = firstProduct?.organization_id;
    if (!orgId) {
      return NextResponse.json(
        { ok: false, error: "Could not determine the shop for your order." },
        { status: 400 }
      );
    }

    const deliveryAddress = [
      address.address_line1,
      address.address_line2,
      `${address.city}, ${address.state} ${address.pincode}`,
    ]
      .filter(Boolean)
      .join(", ");

    const rpcItems = items.map((it) => ({
      product_id: it.product_id,
      quantity: Math.floor(Number(it.qty)),
    }));

    const { data: rpcData, error: rpcErr } = await client.rpc(
      "submit_marketplace_order_atomic",
      {
        p_org_id: orgId,
        p_order_payload: {
          customer_name: String(body.name || address.recipient_name || "").trim(),
          customer_phone: phone,
          delivery_address: deliveryAddress,
          payment_method:
            paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Razorpay",
          delivery_fee: 0,
          items: rpcItems,
        },
      }
    );

    if (rpcErr) {
      console.error("orders/create RPC error:", rpcErr.message);
      return NextResponse.json(
        { ok: false, error: "Order could not be placed. Please try again." },
        { status: 500 }
      );
    }
    if (!rpcData?.success || !rpcData?.order_id) {
      return NextResponse.json(
        { ok: false, error: rpcData?.error || "Order could not be placed." },
        { status: 400 }
      );
    }

    const orderId = rpcData.order_id;
    const status = paymentMethod === "cod" ? "confirmed" : "pending_payment";

    // Stamp the order with its payment status and geo-coded destination.
    await client
      .from("sales_orders")
      .update({
        status,
        destination_address: deliveryAddress,
        destination_lat: address.lat,
        destination_lng: address.lng,
      })
      .eq("id", orderId);

    // Fetch the totals the RPC computed (server-side truth).
    const { data: order } = await client
      .from("sales_orders")
      .select("id, invoice_number, order_number, total_amount, status")
      .eq("id", orderId)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      data: {
        order_id: orderId,
        order_number: order?.invoice_number || order?.order_number || null,
        total: Number(order?.total_amount ?? 0),
        status,
        payment_method: paymentMethod,
      },
    });
  } catch (err) {
    console.error("orders/create error:", err.message);
    return NextResponse.json(
      { ok: false, error: "Order could not be placed. Please try again." },
      { status: 500 }
    );
  }
}
