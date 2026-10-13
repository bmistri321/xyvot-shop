"use client";

import { Minus, Plus } from "lucide-react";

// Circular minus/qty/plus stepper — grocery-app style.
// size: "sm" (cards) | "md" (cart/details)
// Compact stepper buttons are 40px — a deliberate trade-off: full 44px
// would overwhelm the 3-up product cards. WCAG AA minimum is 24px;
// 40px is generous while keeping the Blinkit-approved compact look.
export default function QuantityStepper({ qty, onDecrement, onIncrement, size = "md", label = "quantity" }) {
  const btn =
    size === "sm" ? "w-10 h-10" : "w-11 h-11";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div
      className="inline-flex items-center gap-2"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={onDecrement}
        className={`${btn} rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95`}
        aria-label="Decrease quantity"
      >
        <Minus className={icon} aria-hidden="true" />
      </button>
      <span
        className={`font-bold text-slate-900 text-center tabular-nums ${size === "sm" ? "w-6 text-sm" : "w-8 text-base"}`}
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className={`${btn} rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition active:scale-95 shadow-sm`}
        aria-label="Increase quantity"
      >
        <Plus className={icon} aria-hidden="true" />
      </button>
    </div>
  );
}
