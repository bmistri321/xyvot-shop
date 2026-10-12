"use client";

import { useCallback, useState } from "react";
import ShopCard from "./ShopCard";
import LocationPrompt from "./LocationPrompt";
import { StoreIcon } from "./ShopIcons";

// Homepage section: "Shops Near You".
// Flow: prompt → (geolocate | city | skip) → fetch /api/shops/nearby → row.
// Degrades gracefully: hidden entirely if the API is unreachable, empty state
// if no businesses are returned.

const SKELETON_COUNT = 4;

function ShopCardSkeleton() {
  return (
    <div
      className="shrink-0 rounded-2xl border animate-pulse"
      style={{
        width: "var(--shop-card-width)",
        borderColor: "var(--shop-line)",
        background: "var(--shop-surface)",
      }}
      aria-hidden="true"
    >
      <div style={{ height: "96px", background: "var(--shop-line-soft)" }} className="rounded-t-2xl" />
      <div style={{ padding: "var(--shop-space-3) var(--shop-space-4)" }}>
        <div
          className="rounded"
          style={{ height: "14px", width: "70%", background: "var(--shop-line-soft)" }}
        />
        <div
          className="rounded mt-2"
          style={{ height: "11px", width: "45%", background: "var(--shop-line-soft)" }}
        />
      </div>
    </div>
  );
}

export default function ShopsNearYou() {
  const [stage, setStage] = useState("prompt"); // prompt | loading | done | hidden
  const [shops, setShops] = useState([]);
  const [locating, setLocating] = useState(false);

  const fetchShops = useCallback(async (params) => {
    setStage("loading");
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/shops/nearby?${qs}`);
      const json = await res.json();
      if (json.ok) {
        setShops(json.data || []);
        setStage("done");
      } else {
        setStage("hidden"); // API error → hide section, don't break the page
      }
    } catch {
      setStage("hidden");
    }
  }, []);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      fetchShops({}); // No geolocation support → unranked list
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        fetchShops({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
        });
      },
      () => {
        // Denied or failed → fall back to unranked list
        setLocating(false);
        fetchShops({});
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchShops]);

  const handleCity = useCallback((city) => fetchShops({ city }), [fetchShops]);
  const handleSkip = useCallback(() => fetchShops({}), [fetchShops]);

  if (stage === "hidden") return null;

  return (
    <section
      aria-label="Shops near you"
      className="max-w-7xl mx-auto px-4 sm:px-6"
      style={{ paddingTop: "var(--shop-space-10)", paddingBottom: "var(--shop-space-10)" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--shop-space-6)" }}
      >
        <h2
          className="font-black tracking-tight"
          style={{ fontSize: "var(--shop-text-2xl)", color: "var(--shop-ink)" }}
        >
          Shops near you
        </h2>
      </div>

      {stage === "prompt" && (
        <LocationPrompt
          onLocate={handleLocate}
          onCity={handleCity}
          onSkip={handleSkip}
          locating={locating}
        />
      )}

      {stage === "loading" && (
        <div
          className="flex gap-4 overflow-hidden"
          style={{ gap: "var(--shop-space-4)" }}
          aria-label="Loading nearby shops"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      )}

      {stage === "done" &&
        (shops.length === 0 ? (
          <div
            className="rounded-2xl border text-center"
            style={{
              borderColor: "var(--shop-line)",
              background: "var(--shop-surface-tint)",
              padding: "var(--shop-space-10) var(--shop-space-6)",
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
              <StoreIcon size={24} />
            </div>
            <p className="font-bold" style={{ fontSize: "var(--shop-text-lg)", color: "var(--shop-ink)" }}>
              No shops found near you yet
            </p>
            <p className="mt-2" style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-muted)" }}>
              New neighbourhood shops join every week — check back soon.
            </p>
          </div>
        ) : (
          <div
            className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ gap: "var(--shop-space-4)", scrollbarWidth: "thin" }}
          >
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ))}
    </section>
  );
}
