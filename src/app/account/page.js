"use client";

import { useState, useEffect } from "react";
import { getSupabase, formatPrice } from "@/lib/supabase";

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem("xyvot-session");
      if (s) {
        const parsed = JSON.parse(s);
        setSession(parsed);
        setStep("done");
      }
    } catch {}
  }, []);

  // Load orders when logged in
  useEffect(() => {
    if (step === "done" && session?.phone) {
      loadOrders(session.phone);
    }
  }, [step, session]);

  async function loadOrders(phoneNumber) {
    const client = getSupabase();
    if (!client) return;
    const { data } = await client
      .from("sales_orders")
      .select("id, created_at, status, total_amount, items")
      .eq("customer_phone", phoneNumber)
      .order("created_at", { ascending: false })
      .limit(20);
    setOrders(data || []);
  }

  async function sendOtp(e) {
    e.preventDefault();
    setError("");
    const clean = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not send OTP.");
      setPhone(clean);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Invalid code.");
      const sess = { phone, verifiedAt: Date.now() };
      localStorage.setItem("xyvot-session", JSON.stringify(sess));
      setSession(sess);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("xyvot-session");
    setSession(null);
    setOrders([]);
    setPhone("");
    setOtp("");
    setStep("phone");
  }

  if (step === "done" && session) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My account</h1>
            <p className="mt-1 text-slate-500">+91 {session.phone}</p>
          </div>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-full border-2 border-slate-200 text-sm font-bold hover:border-slate-900"
          >
            Log out
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Order history</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl">
            <p className="font-bold">No orders yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Your orders will appear here after checkout.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="bg-white border border-slate-200 rounded-3xl p-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">
                      Order #{String(o.id).slice(0, 8)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold capitalize">
                    {o.status?.replace(/_/g, " ")}
                  </span>
                </div>
                {o.total_amount && (
                  <p className="mt-3 font-black">{formatPrice(o.total_amount)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-center">Welcome to Xyvot</h1>
      <p className="mt-3 text-center text-slate-500">
        {step === "phone"
          ? "Enter your mobile number to log in with WhatsApp OTP."
          : `We sent a 6-digit code to +91 ${phone} via WhatsApp.`}
      </p>

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="mt-8 space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-bold mb-2">
              Mobile number
            </label>
            <div className="flex">
              <span className="px-4 py-3 rounded-l-2xl bg-slate-100 border-2 border-r-0 border-slate-200 font-semibold">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                inputMode="numeric"
                autoComplete="tel"
                className="flex-1 px-4 py-3 rounded-r-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="p-3 rounded-2xl bg-red-50 text-red-700 text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send OTP on WhatsApp"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-8 space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-bold mb-2">
              6-digit code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-center text-2xl font-mono tracking-[0.5em]"
            />
          </div>
          {error && (
            <p role="alert" className="p-3 rounded-2xl bg-red-50 text-red-700 text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & log in"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-slate-500 hover:text-slate-900"
          >
            ← Use a different number
          </button>
        </form>
      )}
    </main>
  );
}
