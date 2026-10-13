"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  // The mobile tab bar dispatches this to open the cart drawer.
  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("xyvot:open-cart", open);
    return () => window.removeEventListener("xyvot:open-cart", open);
  }, []);

  return (
    <>
      {/* Mobile app bar — slim: the bottom tab bar covers search/cart/account */}
      <header className="sm:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-black tracking-tight" aria-label="Xyvot shop home">
            xyvot<span className="text-green-600">.</span>
          </Link>
        </div>
      </header>

      <header className="hidden sm:block sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight shrink-0" aria-label="Xyvot shop home">
            xyvot<span className="text-green-600">.</span>
          </Link>

          <form
            action="/search"
            method="get"
            className="flex-1 max-w-xl hidden sm:block"
            role="search"
          >
            <input
              type="search"
              name="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for groceries, vegetables, snacks…"
              aria-label="Search products"
              className="w-full px-4 py-2.5 rounded-full bg-slate-100 border-0 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition"
            />
          </form>

          <div className="flex-1 sm:hidden" />

          <Link
            href="/account"
            className="p-2.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Account"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-full hover:bg-slate-100 transition"
            aria-label={`Cart, ${count} items`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
