"use client";

import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/supabase";

// Floating "View cart" pill — the pattern every top Indian commerce app uses.
// Fixed above the mobile tab bar, visible only when the cart has items.
// Tapping it opens the cart drawer via the shared xyvot:open-cart event.
export default function FloatingCartBar() {
  const { count, total } = useCart();

  if (count === 0) return null;

  const openCart = () =>
    window.dispatchEvent(new CustomEvent("xyvot:open-cart"));

  return (
    <div
      className="sm:hidden fixed inset-x-0 z-40 px-4 pointer-events-none"
      style={{
        bottom: "calc(4rem + env(safe-area-inset-bottom) + 12px)",
      }}
      aria-hidden={false}
    >
      <button
        type="button"
        onClick={openCart}
        aria-label={`View cart, ${count} items, total ${formatPrice(total)}`}
        className="pointer-events-auto w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 active:scale-[0.99] transition text-white rounded-full pl-4 pr-3 py-3 shadow-[0_8px_24px_rgba(22,163,74,0.35)] min-h-[56px]"
      >
        <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="flex-1 text-left min-w-0">
          <span className="block text-[15px] font-extrabold leading-tight">
            View cart
          </span>
          <span className="block text-[12px] font-medium text-green-100 leading-tight">
            {count} {count === 1 ? "item" : "items"} &middot;{" "}
            {formatPrice(total)}
          </span>
        </span>
        <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
