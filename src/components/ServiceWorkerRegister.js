"use client";

import { useEffect } from "react";

// Registers the PWA service worker. Safe no-op where unsupported.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Don't fight the dev server's hot reload.
    if (window.location.hostname === "localhost") return;

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
