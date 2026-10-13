"use client";

import { useState } from "react";
import { User, ShoppingBasket } from "lucide-react";

function greetingFor(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// Time-aware greeting — "Good morning / What would you buy today?"
// Computed on first render (not in an effect) so the correct greeting
// shows immediately, even before hydration settles. suppressHydrationWarning
// covers the server/client timezone difference during SSR hydration.
export default function GreetingHeader() {
  const [greeting] = useState(greetingFor);
  const openCart = () =>
    window.dispatchEvent(new CustomEvent("xyvot:open-cart"));
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
        <User className="w-6 h-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          suppressHydrationWarning
          className="font-semibold text-green-700 text-[15px] leading-tight"
        >
          {greeting}
        </p>
        <p className="text-[13px] text-slate-500 leading-tight">What would you buy today?</p>
      </div>
      <button
        type="button"
        onClick={openCart}
        aria-label="Open cart"
        className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0"
      >
        <ShoppingBasket className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
