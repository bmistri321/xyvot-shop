"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/supabase";

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, total } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-4xl mb-4" aria-hidden="true">🛒</p>
              <p className="font-bold text-slate-900">Your cart is empty</p>
              <p className="mt-2 text-sm text-slate-500">
                Add some groceries to get started.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-slate-500">{item.variantLabel}</p>
                    )}
                    <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-full">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-l-full"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold" aria-live="polite">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-r-full"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-xs text-slate-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-sm shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center px-6 py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
