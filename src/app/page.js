import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { getProducts, getCategories, discountPercent } from "@/lib/supabase";
// DEMO DATA — remove before production.
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "@/data/demoProducts";
import DemoBadge from "@/components/DemoBadge";
import ProductCard from "@/components/ProductCard";
import GroceryProductCard from "@/components/GroceryProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryCircleRow from "@/components/CategoryCircleRow";
import GreetingHeader from "@/components/GreetingHeader";
import ShopsNearYou from "@/components/shop/ShopsNearYou";

export default async function Home() {
  const realProducts = await getProducts({ limit: 24 });
  const realCategories = await getCategories();
  // DEMO DATA — remove before production: fall back to placeholder
  // catalog only when the real fetch returns nothing.
  const demoMode = realProducts.length === 0;
  const products = demoMode ? DEMO_PRODUCTS : realProducts;
  const categories = demoMode ? DEMO_CATEGORIES : realCategories;
  const maxOff = products.reduce((m, p) => Math.max(m, discountPercent(p)), 0);

  return (
    <main>
      {/* ============ MOBILE: grocery-app home ============ */}
      <div className="sm:hidden relative px-4 pt-4 pb-8 bg-white text-slate-900">
        {/* Top green gradient wash — fades into white behind the header */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-60 bg-linear-to-b from-[#c9f2da] via-[#e2f8ea]/60 to-transparent pointer-events-none"
        />
        <div className="relative">
        {/* DEMO DATA — remove before production. */}
        {demoMode && <DemoBadge />}
        <GreetingHeader />

        {/* Promo banner — fixed: text + image only, no gradient, no carousel */}
        <section
          aria-label="Current offer"
          className="mt-4 relative overflow-hidden rounded-[24px] bg-[#f2fbf5] p-5"
        >
          <div className="relative max-w-[60%]">
            <p className="text-[20px] font-extrabold leading-snug text-[#0b3d2e]">
              Enjoy The Special Offer Up To {maxOff > 0 ? `${maxOff}%` : "30%"}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-[#5b7a6c]">
              Limited time offer
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 bottom-0 w-[42%] object-cover"
          />
        </section>

        {/* Categories */}
        <section aria-label="Categories" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-extrabold text-slate-900">Categories</h2>
            <Link
              href="/search"
              className="text-[12px] font-semibold text-green-700"
            >
              See all
            </Link>
          </div>
          <CategoryCircleRow categories={categories} />
        </section>

        {/* Fresh products */}
        <section aria-label="Fresh products" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-extrabold text-slate-900">Fresh Products</h2>
            <Link href="/search" className="text-[12px] font-semibold text-green-700">
              See all
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <Store className="w-10 h-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
              <p className="font-bold">No products yet</p>
              <p className="mt-1 text-sm text-slate-500 px-6">
                Shops are stocking their shelves — check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => (
                <GroceryProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
        </div>
      </div>

      {/* ============ DESKTOP: existing layout ============ */}
      <div className="hidden sm:block">
        <section
          aria-label="Shop by category"
          className="bg-[#F6FBD3] py-10 sm:py-14"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-8">
              Groceries &amp; more, delivered in{" "}
              <span className="text-green-700">15 minutes</span>
            </h1>
            <CategoryGrid />
          </div>
        </section>

        <section aria-label="Products" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Fresh picks for you</h2>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800">
              View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-12 h-12 mx-auto mb-4 text-slate-300" aria-hidden="true" />
              <p className="text-xl font-bold">No products yet</p>
              <p className="mt-2 text-slate-500">
                Shops are stocking their shelves — check back soon.
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
      </div>

      {/* Shops near you — location-aware business discovery (all viewports) */}
      <ShopsNearYou />
    </main>
  );
}
