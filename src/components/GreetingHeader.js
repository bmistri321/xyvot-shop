"use client";

import { useState } from "react";

function greetingFor(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// Compact time-aware greeting — sits below the delivery header.
// Computed on first render (not in an effect) so the correct greeting
// shows immediately, even before hydration settles. suppressHydrationWarning
// covers the server/client timezone difference during SSR hydration.
export default function GreetingHeader() {
  const [greeting] = useState(greetingFor);
  return (
    <div className="mt-3">
      <p
        suppressHydrationWarning
        className="font-semibold text-green-700 text-[14px] leading-tight"
      >
        {greeting}
      </p>
      <p className="text-[12px] text-slate-500 leading-tight">
        What would you buy today?
      </p>
    </div>
  );
}
