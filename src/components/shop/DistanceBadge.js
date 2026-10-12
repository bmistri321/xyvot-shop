import { PinIcon } from "./ShopIcons";

// Small pill showing how far a shop is, e.g. "2.3 km away".
// Renders nothing when distance is unknown — callers must not show
// a misleading badge in that case.
export default function DistanceBadge({ distanceKm }) {
  if (distanceKm === null || distanceKm === undefined) return null;

  const label =
    distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m away`
      : `${distanceKm.toFixed(1)} km away`;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-semibold"
      style={{
        fontSize: "var(--shop-text-xs)",
        padding: "2px var(--shop-space-2)",
        background: "var(--shop-accent-soft)",
        color: "var(--shop-accent-dark)",
      }}
    >
      <PinIcon size={11} />
      {label}
    </span>
  );
}
