import Link from "next/link";
import Image from "next/image";
import DistanceBadge from "./DistanceBadge";
import { StoreIcon } from "./ShopIcons";

// Card for a single business in the "Shops Near You" row.
// Fixed width so it works in a horizontal scroll container.
export default function ShopCard({ shop }) {
  const href = `/shop/${shop.id}`;
  const initial = (shop.name || "?").charAt(0).toUpperCase();

  return (
    <Link
      href={href}
      className="group shrink-0 rounded-2xl border bg-white transition-shadow hover:shadow-lg flex flex-col"
      style={{
        width: "var(--shop-card-width)",
        borderColor: "var(--shop-line)",
        boxShadow: "var(--shop-shadow-card)",
      }}
      aria-label={`Visit ${shop.name}`}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center overflow-hidden rounded-t-2xl"
        style={{
          height: "96px",
          background: "var(--shop-surface-tint)",
        }}
      >
        {shop.logo_url ? (
          <Image
            src={shop.logo_url}
            alt={`${shop.name} logo`}
            width={96}
            height={96}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-full font-black"
            style={{
              width: "var(--shop-card-logo)",
              height: "var(--shop-card-logo)",
              fontSize: "var(--shop-text-xl)",
              background: "var(--shop-accent-soft)",
              color: "var(--shop-accent-dark)",
            }}
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
      </div>

      {/* Details */}
      <div
        className="flex flex-1 flex-col"
        style={{ padding: "var(--shop-space-3) var(--shop-space-4)" }}
      >
        <h3
          className="font-bold truncate"
          style={{ fontSize: "var(--shop-text-base)", color: "var(--shop-ink)" }}
        >
          {shop.name}
        </h3>

        <div
          className="mt-1 flex items-center gap-2 flex-wrap"
          style={{ fontSize: "var(--shop-text-xs)", color: "var(--shop-muted)" }}
        >
          {shop.city && (
            <span className="inline-flex items-center gap-1">
              <StoreIcon size={11} />
              {shop.city}
            </span>
          )}
          <DistanceBadge distanceKm={shop.distance_km} />
        </div>

        <span
          className="mt-3 inline-flex items-center font-bold group-hover:underline"
          style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-accent-dark)" }}
        >
          Visit shop →
        </span>
      </div>
    </Link>
  );
}
