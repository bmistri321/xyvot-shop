"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/supabase";
import { getSessionPhone } from "@/lib/session";
import { Check, RefreshCw } from "lucide-react";

// Canonical tracking steps — the API timeline maps onto these.
const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function stepIndex(status) {
  const s = (status || "").toLowerCase();
  const map = {
    placed: 0, pending: 0, new: 0,
    confirmed: 1, accepted: 1,
    preparing: 2, packing: 2,
    out_for_delivery: 3, dispatched: 3, on_the_way: 3,
    delivered: 4, completed: 4,
  };
  return map[s] ?? 0;
}

function isCancelled(status) {
  return ["cancelled", "canceled", "rejected", "failed"].includes((status || "").toLowerCase());
}

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params?.id;
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!orderId) return;
    const phone = getSessionPhone();
    if (!phone) {
      setError("Please log in to track your order.");
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const res = await fetch(
        `/api/orders/track?order_id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not load tracking.");
      setTrack(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 30s while the order is still active
  useEffect(() => {
    if (!track) return;
    const done = ["delivered", "completed", "cancelled", "canceled"].includes(
      (track.delivery_status || track.status || "").toLowerCase()
    );
    if (done) return;
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [track, load]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-48 rounded-full bg-slate-100 animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-5 flex-1 rounded-full bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !track) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black">Couldn&apos;t load tracking</h1>
        <p className="mt-3 text-slate-500">{error || "Order not found."}</p>
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => load()}
            className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold"
          >
            Try again
          </button>
          <Link href="/account" className="px-6 py-3 rounded-full border-2 border-slate-200 font-bold">
            My orders
          </Link>
        </div>
      </main>
    );
  }

  const current = isCancelled(track.delivery_status || track.status)
    ? -1
    : stepIndex(track.delivery_status || track.status);
  const showPin = (track.delivery_status || "").toLowerCase() === "out_for_delivery" && track.delivery_pin;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex gap-2">
          <li><Link href="/account" className="hover:text-slate-900">Orders</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">
            #{track.order_number || String(orderId).slice(0, 8)}
          </li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black">Track order</h1>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="px-4 py-2 rounded-full border-2 border-slate-200 text-sm font-bold hover:border-slate-900 disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : (
            <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh</span>
          )}
        </button>
      </div>
      <p className="text-slate-500 mb-8">
        Order #{track.order_number || String(orderId).slice(0, 8)}
        {track.total != null && (
          <> • <span className="font-bold text-slate-900">{formatPrice(track.total)}</span></>
        )}
      </p>

      {showPin && (
        <div className="mb-8 p-6 rounded-3xl bg-orange-50 border-2 border-orange-200 text-center">
          <p className="text-sm font-bold text-orange-800 uppercase tracking-wide">Delivery PIN</p>
          <p className="mt-2 text-5xl font-black tracking-[0.3em] text-orange-700">{track.delivery_pin}</p>
          <p className="mt-3 text-sm text-orange-800">
            Share this PIN with your delivery partner to receive your order.
          </p>
        </div>
      )}

      {current === -1 ? (
        <div className="p-6 rounded-3xl bg-red-50 text-center">
          <p className="text-xl font-bold text-red-700">Order cancelled</p>
          <p className="mt-2 text-sm text-red-600">This order was cancelled. Contact support if this looks wrong.</p>
        </div>
      ) : (
        <ol className="relative">
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={step.key} className="flex gap-4 pb-8 last:pb-0 relative">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-5 top-10 bottom-0 w-0.5 ${i < current ? "bg-orange-500" : "bg-slate-200"}`}
                  />
                )}
                <span
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${
                    done
                      ? "bg-orange-600 text-white"
                      : active
                        ? "bg-orange-100 text-orange-700 ring-4 ring-orange-200"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
                </span>
                <div className="pt-1.5">
                  <p className={`font-bold ${active ? "text-slate-900" : done ? "text-slate-700" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  {active && track.timeline?.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(track.timeline[track.timeline.length - 1].at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/" className="flex-1 py-3.5 rounded-full bg-slate-900 text-white font-bold text-center hover:bg-slate-800">
          Continue shopping
        </Link>
        <Link href="/account" className="flex-1 py-3.5 rounded-full border-2 border-slate-200 font-bold text-center hover:border-slate-900">
          All orders
        </Link>
      </div>
    </main>
  );
}
