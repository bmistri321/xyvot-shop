import { notFound } from "next/navigation";
import Image from "next/image";
import { getShop, getProducts } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { PinIcon, StoreIcon } from "@/components/shop/ShopIcons";
import { Store } from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const shop = await getShop(id);
  if (!shop) return { title: "Shop not found" };
  return {
    title: `${shop.name} — shop on Xyvot`,
    description: shop.city
      ? `Shop ${shop.name}'s products on Xyvot Shop. Based in ${shop.city}.`
      : `Shop ${shop.name}'s products on Xyvot Shop.`,
  };
}

export default async function ShopPage({ params }) {
  const { id } = await params;
  const shop = await getShop(id);
  if (!shop) notFound();

  const products = await getProducts({ organizationId: id, limit: 48 });
  const initial = (shop.name || "?").charAt(0).toUpperCase();

  return (
    <main>
      {/* Shop header */}
      <section
        aria-label={`${shop.name} profile`}
        style={{ background: "var(--shop-surface-tint)" }}
        className="border-b"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6"
          style={{
            paddingTop: "var(--shop-space-8)",
            paddingBottom: "var(--shop-space-8)",
            borderColor: "var(--shop-line)",
          }}
        >
          {/* Logo */}
          {shop.logo_url ? (
            <Image
              src={shop.logo_url}
              alt={`${shop.name} logo`}
              width={88}
              height={88}
              className="rounded-2xl object-cover shrink-0 border"
              style={{ borderColor: "var(--shop-line)" }}
            />
          ) : (
            <span
              className="flex items-center justify-center rounded-2xl font-black shrink-0"
              style={{
                width: "88px",
                height: "88px",
                fontSize: "36px",
                background: "var(--shop-accent-soft)",
                color: "var(--shop-accent-dark)",
              }}
              aria-hidden="true"
            >
              {initial}
            </span>
          )}

          <div className="min-w-0">
            <h1
              className="font-black tracking-tight truncate"
              style={{ fontSize: "var(--shop-text-2xl)", color: "var(--shop-ink)" }}
            >
              {shop.name}
            </h1>
            <div
              className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
              style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-muted)" }}
            >
              {(shop.city || shop.address) && (
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon size={14} />
                  {[shop.address, shop.city].filter(Boolean).join(", ")}
                </span>
              )}
              {shop.owner_phone && (
                <a
                  href={`tel:${shop.owner_phone}`}
                  className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                  style={{ color: "var(--shop-accent-dark)" }}
                >
                  <StoreIcon size={14} />
                  {shop.owner_phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        aria-label={`${shop.name} products`}
        className="max-w-7xl mx-auto px-4 sm:px-6"
        style={{ paddingTop: "var(--shop-space-8)", paddingBottom: "var(--shop-space-12)" }}
      >
        <h2
          className="font-black"
          style={{
            fontSize: "var(--shop-text-xl)",
            color: "var(--shop-ink)",
            marginBottom: "var(--shop-space-6)",
          }}
        >
          Products
        </h2>

        {products.length === 0 ? (
          <div className="text-center" style={{ padding: "var(--shop-space-12) 0" }}>
            <Store className="w-12 h-12 mx-auto mb-4 text-slate-300" aria-hidden="true" />
            <p className="font-bold" style={{ fontSize: "var(--shop-text-lg)", color: "var(--shop-ink)" }}>
              No products yet
            </p>
            <p className="mt-2" style={{ fontSize: "var(--shop-text-sm)", color: "var(--shop-muted)" }}>
              {shop.name} is still stocking their shelves — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
