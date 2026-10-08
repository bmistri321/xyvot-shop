"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { getSupabase, formatPrice } from "@/lib/supabase";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in your name, phone, and delivery address.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setPlacing(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error("Shop is not connected. Please try again later.");

      // For marketplace checkout, use the org of the first item.
      // (Multi-shop carts split by org in a future update.)
      const { data: product } = await client
        .from("products")
        .select("organization_id")
        .eq("id", items[0].productId)
        .maybeSingle();

      const orgId = product?.organization_id;
      if (!orgId) throw new Error("Could not determine the shop for your order.");

      const rpcItems = items.map((it) => ({
        product_id: it.productId,
        quantity: it.qty,
      }));

      const { data, error: rpcErr } = await client.rpc(
        "submit_marketplace_order_atomic",
        {
          p_org_id: orgId,
          p_order_payload: {
            customer_name: form.name.trim(),
            customer_phone: form.phone.trim(),
            delivery_address: form.address.trim(),
            payment_method: "Cash on Delivery (COD)",
            delivery_fee: 0,
            items: rpcItems,
          },
        }
      );

      if (rpcErr) throw new Error(rpcErr.message);
      if (!data?.success || !data?.order_id) {
        throw new Error(data?.error || "Order could not be placed.");
      }

      clear();
      router.push(`/order-success?order=${data.order_id}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <p className="mt-4 text-slate-500">Add some products before checking out.</p>
        <a
          href="/"
          className="mt-8 inline-block px-8 py-3 rounded-full bg-slate-900 text-white font-bold"
        >
          Continue shopping
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={placeOrder} className="md:col-span-3 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold mb-2">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="Your name"
              autoComplete="name"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-bold mb-2">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-bold mb-2">
              Delivery address
            </label>
            <textarea
              id="address"
              value={form.address}
              onChange={update("address")}
              placeholder="House no, street, landmark, area, PIN code"
              autoComplete="street-address"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <p role="alert" className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="w-full py-4 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 disabled:opacity-50 transition"
          >
            {placing ? "Placing order…" : `Place order • ${formatPrice(total)}`}
          </button>
          <p className="text-xs text-slate-500 text-center">
            Cash on Delivery • Pay when your order arrives
          </p>
        </form>

        <aside className="md:col-span-2">
          <div className="bg-slate-50 rounded-3xl p-6">
            <h2 className="font-bold mb-4">Order summary</h2>
            <ul className="space-y-3 text-sm">
              {items.map((it) => (
                <li key={it.key} className="flex justify-between gap-2">
                  <span className="truncate">
                    {it.title} × {it.qty}
                  </span>
                  <span className="font-semibold shrink-0">
                    {formatPrice(it.price * it.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-black text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
