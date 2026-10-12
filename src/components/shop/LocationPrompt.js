"use client";

import { useState } from "react";
import { PinIcon, SearchIcon } from "./ShopIcons";

// Friendly location prompt shown before the browser geolocation request.
// Explains WHY we ask, then offers: use precise location, type a city, skip.
export default function LocationPrompt({ onLocate, onCity, onSkip, locating }) {
  const [city, setCity] = useState("");
  const [mode, setMode] = useState("ask"); // ask | city

  const submitCity = (e) => {
    e.preventDefault();
    if (city.trim()) onCity(city.trim());
  };

  return (
    <div
      className="rounded-2xl border text-center"
      style={{
        borderColor: "var(--shop-line)",
        background: "var(--shop-surface-tint)",
        padding: "var(--shop-space-8) var(--shop-space-6)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-center rounded-full"
        style={{
          width: "52px",
          height: "52px",
          background: "var(--shop-accent-soft)",
          color: "var(--shop-accent-dark)",
          marginBottom: "var(--shop-space-4)",
        }}
        aria-hidden="true"
      >
        <PinIcon size={24} />
      </div>

      <h3
        className="font-bold"
        style={{ fontSize: "var(--shop-text-lg)", color: "var(--shop-ink)" }}
      >
        Find shops near you
      </h3>
      <p
        className="mx-auto mt-2 max-w-sm"
        style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-muted)" }}
      >
        Share your location and we&apos;ll show the closest neighbourhood shops
        first. Your location never leaves your device.
      </p>

      {mode === "ask" ? (
        <div
          className="mt-5 flex flex-col items-center gap-3"
          style={{ gap: "var(--shop-space-3)" }}
        >
          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            className="rounded-full font-bold text-white transition-colors disabled:opacity-60"
            style={{
              background: "var(--shop-accent)",
              padding: "var(--shop-space-3) var(--shop-space-6)",
              fontSize: "var(--shop-text-sm)",
            }}
          >
            {locating ? "Locating…" : "Use my location"}
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode("city")}
              className="font-semibold underline underline-offset-2"
              style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-accent-dark)" }}
            >
              Enter city instead
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="font-semibold"
              style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-muted)" }}
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={submitCity}
          className="mx-auto mt-5 flex max-w-xs items-center gap-2"
        >
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--shop-faint)" }}
              aria-hidden="true"
            >
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
              aria-label="Your city"
              className="w-full rounded-full border outline-none focus:ring-2"
              style={{
                borderColor: "var(--shop-line)",
                padding: "var(--shop-space-2) var(--shop-space-3) var(--shop-space-2) 36px",
                fontSize: "var(--shop-text-sm)",
              }}
            />
          </div>
          <button
            type="submit"
            className="rounded-full font-bold text-white shrink-0"
            style={{
              background: "var(--shop-ink)",
              padding: "var(--shop-space-2) var(--shop-space-4)",
              fontSize: "var(--shop-text-sm)",
            }}
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
