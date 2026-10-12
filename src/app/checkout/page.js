"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/supabase";
import { getSessionPhone } from "@/lib/session";
import AddressForm, { formatAddress } from "@/components/AddressForm";
import RazorpayPay from "@/components/RazorpayPay";

const STEPS = ["Address", "Payment", "Review"];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(null);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [inlineAddress, setInlineAddress] = useState(null); // unsaved, for guests
  const [guestPhone, setGuestPhone] = useState("");
  const [guestName, setGuestName] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod | razorpay
  const [razorpayDown, setRazorpayDown] = useState(false);

  // Order state
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    setPhone(getSessionPhone());
  }, []);

  useEffect(() => {
    if (phone) loadAddresses(phone);
  }, [phone]);

  async function loadAddresses(p) {
    setAddressesLoading(true);
    try {
      const res = await fetch(`/api/addresses?phone=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data.ok) {
        const list = data.data || [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch {}
    finally {
      setAddressesLoading(false);
    }
  }

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || inlineAddress;

  function validateAddressStep() {
    if (!selectedAddressId && !inlineAddress) {
      setError("Please select or add a delivery address.");
      return false;
    }
    if (!phone) {
      // Guest: need phone + name
      if (!/^[6-9]\d{9}$/.test(guestPhone.replace(/\D/g, "").slice(-10))) {
        setError("Please enter a valid 10-digit mobile number.");
        return false;
      }
      if (!guestName.trim()) {
        setError("Please enter your name.");
        return false;
      }
    }
    return true;
  }

  async function saveInlineAddress(payload) {
    const effectivePhone = phone || guestPhone.replace(/\D/g, "").slice(-10);
    if (!effectivePhone) {
      setError("Please enter your mobile number first.");
      return;
    }
    // Persist to the address book so we get an address_id for the order.
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, phone: effectivePhone }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not save address.");
      if (phone) {
        await loadAddresses(phone);
      } else {
        // Guest: keep the saved address locally for selection
        const saved = { ...payload, id: data.data?.id, phone: effectivePhone };
        setInlineAddress(saved);
      }
      if (data.data?.id) setSelectedAddressId(data.data.id);
    } catch (err) {
      setError(err.message);
      return;
    }
    setShowNewAddress(false);
    setError("");
  }

  async function createOrder() {
    const customerPhone = phone || guestPhone.replace(/\D/g, "").slice(-10);
    const customerName = phone
      ? selectedAddress?.name || "Customer"
      : guestName.trim();

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: customerPhone,
        name: customerName,
        address_id: selectedAddressId || null,
        items: items.map((it) => ({ product_id: it.productId, qty: it.qty })),
        payment_method: paymentMethod === "razorpay" ? "razorpay" : "cod",
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Could not place order.");
    return data.data;
  }

  async function placeCodOrder() {
    setError("");
    setPlacing(true);
    try {
      const order = await createOrder();
      clear();
      router.push(`/order-success?order=${order.order_id}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  async function prepareRazorpayOrder() {
    // Create the shop order first (pending payment), then pay against it.
    setError("");
    setPlacing(true);
    try {
      const order = await createOrder();
      setCreatedOrderId(order.order_id);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function handlePaymentSuccess() {
    clear();
    router.push(`/order-success?order=${createdOrderId}&paid=1`);
  }

  function next() {
    setError("");
    if (step === 0 && !validateAddressStep()) return;
    if (step === 1 && paymentMethod === "razorpay" && !createdOrderId) {
      prepareRazorpayOrder().then(() => {
        if (!error) setStep(2);
      });
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <p className="mt-4 text-slate-500">Add some products before checking out.</p>
        <Link href="/" className="mt-8 inline-block px-8 py-3 rounded-full bg-slate-900 text-white font-bold">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black mb-6">Checkout</h1>

      {/* Stepper */}
      <ol className="flex mb-8" aria-label="Checkout steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1 flex items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                  i < step ? "bg-orange-600 text-white" : i === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`text-sm font-bold ${i === step ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="flex-1 h-0.5 bg-slate-200 mx-3" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          {/* STEP 1 — Address */}
          {step === 0 && (
            <section aria-label="Delivery address">
              {!phone && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="ck-name" className="block text-sm font-bold mb-2">Full name</label>
                    <input id="ck-name" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="ck-phone" className="block text-sm font-bold mb-2">Mobile number</label>
                    <input id="ck-phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" autoComplete="tel" inputMode="numeric" className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none" />
                  </div>
                </div>
              )}

              {phone && (
                <>
                  {addressesLoading ? (
                    <div className="space-y-3" aria-hidden="true">
                      {[1, 2].map((i) => <div key={i} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />)}
                    </div>
                  ) : (
                    <ul className="space-y-3 mb-4">
                      {addresses.map((a) => (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => { setSelectedAddressId(a.id); setInlineAddress(null); }}
                            aria-pressed={selectedAddressId === a.id && !inlineAddress}
                            className={`w-full text-left p-5 rounded-3xl border-2 transition-colors ${
                              selectedAddressId === a.id && !inlineAddress ? "border-orange-600 bg-orange-50/50" : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold">{a.label || "Home"}</span>
                              {a.is_default && <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">Default</span>}
                            </div>
                            <p className="mt-2 font-bold text-sm">{a.name} • {a.phone}</p>
                            <p className="mt-1 text-sm text-slate-600">{formatAddress(a)}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-3 text-sm mb-4">
                    <Link href="/account/addresses" className="font-bold text-orange-700 hover:text-orange-800">Manage addresses →</Link>
                  </div>
                </>
              )}

              {showNewAddress ? (
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <h2 className="font-bold mb-4">Add delivery address</h2>
                  <AddressForm
                    onSubmit={saveInlineAddress}
                    onCancel={() => setShowNewAddress(false)}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewAddress(true)}
                  className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-300 font-bold text-slate-600 hover:border-orange-500 hover:text-orange-700"
                >
                  + Add a new address
                </button>
              )}

              {inlineAddress && !phone && (
                <div className="mt-4 p-5 rounded-3xl border-2 border-orange-600 bg-orange-50/50">
                  <p className="font-bold text-sm">{inlineAddress.name} • {inlineAddress.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatAddress(inlineAddress)}</p>
                </div>
              )}
            </section>
          )}

          {/* STEP 2 — Payment method */}
          {step === 1 && (
            <section aria-label="Payment method">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  aria-pressed={paymentMethod === "razorpay"}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-colors ${
                    paymentMethod === "razorpay" ? "border-orange-600 bg-orange-50/50" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <p className="font-bold">💳 Pay online</p>
                  <p className="mt-1 text-sm text-slate-500">UPI, cards, netbanking via Razorpay</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  aria-pressed={paymentMethod === "cod"}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-colors ${
                    paymentMethod === "cod" ? "border-orange-600 bg-orange-50/50" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <p className="font-bold">💵 Cash on Delivery</p>
                  <p className="mt-1 text-sm text-slate-500">Pay when your order arrives</p>
                </button>
              </div>
              {razorpayDown && paymentMethod === "razorpay" && (
                <p className="mt-4 p-4 rounded-2xl bg-amber-50 text-amber-800 text-sm font-medium">
                  Online payment isn&apos;t available right now — you can continue with Cash on Delivery.
                </p>
              )}
            </section>
          )}

          {/* STEP 3 — Review & pay */}
          {step === 2 && (
            <section aria-label="Review order">
              <div className="p-5 rounded-3xl border-2 border-slate-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold">Deliver to</h2>
                  <button type="button" onClick={() => setStep(0)} className="text-sm font-bold text-orange-700">Change</button>
                </div>
                {selectedAddress ? (
                  <>
                    <p className="font-bold text-sm">{selectedAddress.name} • {selectedAddress.phone}</p>
                    <p className="mt-1 text-sm text-slate-600">{formatAddress(selectedAddress)}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No address selected.</p>
                )}
              </div>

              <div className="p-5 rounded-3xl border-2 border-slate-200 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold">Payment</h2>
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-orange-700">Change</button>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {paymentMethod === "razorpay" ? "💳 Pay online via Razorpay" : "💵 Cash on Delivery"}
                </p>
              </div>

              {paymentMethod === "cod" ? (
                <button
                  type="button"
                  onClick={placeCodOrder}
                  disabled={placing}
                  className="w-full py-4 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 disabled:opacity-50 transition"
                >
                  {placing ? "Placing order…" : `Place order • ${formatPrice(total)}`}
                </button>
              ) : createdOrderId ? (
                <RazorpayPay
                  orderId={createdOrderId}
                  amount={total}
                  customerName={selectedAddress?.name}
                  customerPhone={phone || guestPhone}
                  buttonLabel={`Pay ${formatPrice(total)}`}
                  onSuccess={handlePaymentSuccess}
                  onFailure={(msg) => setError(msg)}
                  onNotConfigured={() => {
                    setRazorpayDown(true);
                    setPaymentMethod("cod");
                    setCreatedOrderId(null);
                    setStep(1);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={next}
                  disabled={placing}
                  className="w-full py-4 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 disabled:opacity-50 transition"
                >
                  {placing ? "Preparing payment…" : "Continue to payment"}
                </button>
              )}
              {paymentMethod === "cod" && (
                <p className="mt-3 text-xs text-slate-500 text-center">Cash on Delivery • Pay when your order arrives</p>
              )}
            </section>
          )}

          {error && (
            <p role="alert" className="mt-4 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
              {error}
            </p>
          )}

          {/* Nav buttons */}
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="px-6 py-3.5 rounded-full border-2 border-slate-200 font-bold hover:border-slate-900"
              >
                ← Back
              </button>
            )}
            {step < 2 && (
              <button
                type="button"
                onClick={next}
                disabled={placing}
                className="flex-1 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                {placing ? "Please wait…" : "Continue →"}
              </button>
            )}
          </div>
        </div>

        {/* Order summary */}
        <aside className="md:col-span-2">
          <div className="bg-slate-50 rounded-3xl p-6 md:sticky md:top-6">
            <h2 className="font-bold mb-4">Order summary</h2>
            <ul className="space-y-3 text-sm">
              {items.map((it) => (
                <li key={it.key} className="flex justify-between gap-2">
                  <span className="truncate">{it.title} × {it.qty}</span>
                  <span className="font-semibold shrink-0">{formatPrice(it.price * it.qty)}</span>
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
