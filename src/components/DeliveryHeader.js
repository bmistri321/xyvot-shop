"use client";

import Link from "next/link";
import { MapPin, ChevronDown, User } from "lucide-react";

// Slim delivery/location header — the pattern every top Indian commerce app
// leads with: a delivery promise + tappable location on the left,
// account avatar on the right. Mobile only (rendered in the mobile home block).
export default function DeliveryHeader() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-500 leading-tight">
          Delivery in
        </p>
        <p className="text-[22px] font-extrabold text-slate-900 leading-tight tracking-tight">
          30 mins
        </p>
        <Link
          href="/account"
          className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-slate-600 min-h-[40px] max-w-full py-1"
          aria-label="Set delivery location"
        >
          <MapPin
            className="w-4 h-4 text-green-700 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate font-medium">Set location</span>
          <ChevronDown
            className="w-3.5 h-3.5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        </Link>
      </div>
      <Link
        href="/account"
        aria-label="Account"
        className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 active:scale-95 transition"
      >
        <User className="w-5 h-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
