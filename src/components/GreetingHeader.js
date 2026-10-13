"use client";

import { useState } from "react";
import { User } from "lucide-react";

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
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
        <User className="w-6 h-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p
          suppressHydrationWarning
          className="font-bold text-slate-900 text-[15px] leading-tight"
        >
          {greeting}
        </p>
        <p className="text-[13px] text-slate-500 leading-tight">What would you buy today?</p>
      </div>
    </div>
  );
}
