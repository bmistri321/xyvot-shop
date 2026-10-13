import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { getProducts } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import ShopsNearYou from "@/components/shop/ShopsNearYou";

export default async function Home() {
  const products = await getProducts({ limit: 24 });

  return (
    <main>
      {/* Categories — expandable grid */}
      <section
        aria-label="Shop by category"
        className="bg-[#F6FBD3] py-10 sm:py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-8">
            Groceries &amp; more, delivered in{" "}
            <span className="text-orange-600">15 minutes</span>
          </h1>
          <CategoryGrid />
        </div>
      </section>

      {/* Shops near you — location-aware business discovery */}
      <ShopsNearYou />

      {/* Products */}
      <section aria-label="Products" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">Fresh picks for you</h2>
          <Link href="/search" className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800">
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
    </main>
  );
}
