"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

// Time-aware greeting — "Good morning / What would you buy today?"
export default function GreetingHeader() {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
        <User className="w-6 h-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-bold text-slate-900 text-[15px] leading-tight">{greeting}</p>
        <p className="text-[13px] text-slate-500 leading-tight">What would you buy today?</p>
      </div>
    </div>
  );
}
