"use client";

import { useState, useEffect, useRef } from "react";

const SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

// Loads the Razorpay SDK and drives the payment flow:
//  1. POST /api/payments/razorpay/create-order { order_id }
//  2. Open Razorpay Checkout with the returned razorpay_order_id
//  3. On success → POST /api/payments/razorpay/verify → onSuccess()
//  4. On dismiss/failure → onFailure(reason)
// If keys aren't configured server-side, calls onNotConfigured() so the
// caller can fall back to COD.

export default function RazorpayPay({
  orderId,
  amount,
  customerName,
  customerPhone,
  buttonLabel,
  onSuccess,
  onFailure,
  onNotConfigured,
}) {
  const [state, setState] = useState("idle"); // idle | loading | ready | paying | error
  const [error, setError] = useState("");
  const rzpRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    if (window.Razorpay) {
      if (!cancelled) setState("ready");
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => {
      if (!cancelled) setState(window.Razorpay ? "ready" : "error");
    };
    script.onerror = () => {
      if (!cancelled) {
        setState("error");
        setError("Could not load the payment gateway. Check your connection and try again.");
      }
    };
    document.body.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, []);

  async function pay() {
    setError("");
    setState("paying");
    try {
      // 1. Create the Razorpay order server-side
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();

      // Keys not configured yet — backend returns a stub success
      if (data.ok && data.stub) {
        setState("ready");
        onNotConfigured?.();
        return;
      }

      if (!data.ok) {
        throw new Error(data.error || "Could not start payment.");
      }

      const { razorpay_order_id, amount: amt, key_id, currency = "INR" } = data.data || {};
      if (!razorpay_order_id || !key_id) throw new Error("Invalid payment order from server.");

      // 2. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: key_id,
        amount: amt,
        currency,
        order_id: razorpay_order_id,
        name: "Xyvot Shop",
        description: `Order payment`,
        prefill: { name: customerName || "", contact: customerPhone || "" },
        theme: { color: "#ea580c" },
        handler: async function (response) {
          // 3. Verify signature server-side
          try {
            const vres = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              }),
            });
            const vdata = await vres.json();
            if (!vdata.ok) throw new Error(vdata.error || "Payment verification failed.");
            setState("ready");
            onSuccess?.(vdata.data);
          } catch (err) {
            setState("error");
            setError(err.message);
            onFailure?.(err.message);
          }
        },
        modal: {
          ondismiss: function () {
            setState("ready");
            onFailure?.("Payment was cancelled.");
          },
        },
      });
      rzpRef.current = rzp;
      rzp.on("payment.failed", function (resp) {
        setState("error");
        const msg = resp?.error?.description || "Payment failed. Please try again.";
        setError(msg);
        onFailure?.(msg);
      });
      rzp.open();
    } catch (err) {
      setState("error");
      setError(err.message || "Something went wrong starting payment.");
      onFailure?.(err.message);
    }
  }

  useEffect(() => {
    return () => {
      try { rzpRef.current?.close(); } catch {}
    };
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={state !== "ready"}
        className="w-full py-4 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 disabled:opacity-50 transition"
      >
        {state === "loading" && "Loading payment…"}
        {state === "paying" && "Opening payment…"}
        {state === "ready" && (buttonLabel || "Pay now")}
        {state === "error" && "Retry payment"}
        {state === "idle" && (buttonLabel || "Pay now")}
      </button>
      {error && (
        <p role="alert" className="mt-3 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
