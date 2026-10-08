import Link from "next/link";
import { getProducts, getCategories } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";


export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 24 }),
    getCategories(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
            Groceries in <span className="text-orange-600">15 minutes</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">
            Fresh vegetables, dairy, snacks, and essentials from shops near
            you — delivered fast.
          </p>
          <form action="/search" method="get" role="search" className="mt-8 max-w-xl mx-auto">
            <input
              type="search"
              name="q"
              placeholder="Search for atta, milk, vegetables…"
              aria-label="Search products"
              className="w-full px-6 py-4 rounded-full border-2 border-slate-200 text-base focus:border-orange-500 focus:outline-none shadow-sm"
            />
          </form>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section aria-label="Categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="shrink-0 px-5 py-2.5 rounded-full bg-slate-100 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section aria-label="Products" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">Fresh picks for you</h2>
          <Link href="/search" className="text-sm font-bold text-orange-700 hover:text-orange-800">
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4" aria-hidden="true">🏪</p>
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
