"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ShoppingCart, ShoppingBag, Ticket, Trash2, Package,
} from "lucide-react";
import { useCart } from "./CartContext";
import QuantityStepper from "./QuantityStepper";
import { formatPrice } from "@/lib/supabase";

// Grocery-app cart: line-item cards with steppers, coupon strip,
// Subtotal / Delivery / Total, green pill checkout.
export default function CartDrawer({ open, onClose }) {
  const router = useRouter();
  const { items, updateQty, removeItem, total } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);

  if (!open) return null;

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    // No coupon backend yet — be honest rather than fake a discount.
    setCouponMsg("This code isn't valid — coupons launch soon.");
    setTimeout(() => setCouponMsg(null), 3000);
  };

  const close = () => {
    setCoupon("");
    setCouponMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-hidden="true"
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-[#FAFAF8] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={close}
            className="w-9 h-9 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center"
            aria-label="Close cart"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h2 className="text-[15px] font-bold">My Cart</h2>
          <span className="w-9" aria-hidden="true" />
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-white">
            <span className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-9 h-9 text-green-600" aria-hidden="true" />
            </span>
            <p className="font-extrabold text-lg text-slate-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">
              Add some fresh groceries to get started.
            </p>
            <button
              onClick={close}
              className="mt-6 px-8 py-3.5 rounded-full bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Line items */}
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex gap-3"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-6 h-6" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-slate-900 leading-snug line-clamp-1">
                        {item.title}
                      </p>
                      {item.variantLabel ? (
                        <p className="text-[11px] text-slate-500">{item.variantLabel}</p>
                      ) : null}
                      <p className="text-[13px] font-extrabold text-slate-900 mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          qty={item.qty}
                          label={`${item.title} quantity`}
                          onDecrement={() => updateQty(item.key, item.qty - 1)}
                          onIncrement={() => updateQty(item.key, item.qty + 1)}
                        />
                        <button
                          onClick={() => removeItem(item.key)}
                          className="p-3 -mr-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Coupon strip */}
              <div className="mt-4 rounded-2xl bg-green-600 text-white p-3.5">
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <p className="text-[13px] font-bold flex-1">Have a coupon code?</p>
                </div>
                <div className="mt-2.5 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    aria-label="Coupon code"
                    className="flex-1 min-w-0 rounded-full bg-white/15 placeholder:text-green-100 text-sm font-semibold px-4 py-3 outline-none focus:bg-white/25"
                  />
                  <button
                    onClick={applyCoupon}
                    className="min-h-[44px] px-5 py-3 rounded-full bg-white text-green-700 text-sm font-bold hover:bg-green-50 transition shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className="mt-2 text-[12px] text-green-100" role="status">
                    {couponMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Totals + checkout */}
            <div
              className="bg-white border-t border-slate-100 px-5 pt-4 shrink-0"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-bold text-slate-900 tabular-nums">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="font-bold text-green-700">Free</dd>
                </div>
                <div className="flex justify-between pt-1.5 mt-1 border-t border-slate-100">
                  <dt className="font-extrabold text-slate-900">Total</dt>
                  <dd className="font-extrabold text-lg text-green-700 tabular-nums">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 flex w-full items-center justify-center gap-2 px-6 py-4 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition active:scale-[0.99]"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                Checkout Now
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
