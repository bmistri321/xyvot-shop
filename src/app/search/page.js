import { SearchX } from "lucide-react";
import { getProducts } from "@/lib/supabase";
// DEMO DATA — remove before production.
import { searchDemoProducts } from "@/data/demoProducts";
import ProductCard from "@/components/ProductCard";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  const query = q || "";
  return {
    title: query ? `Search: ${query}` : "Search products",
    description: query
      ? `Search results for "${query}" on Xyvot Shop.`
      : "Search groceries and essentials on Xyvot Shop.",
  };
}

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const realProducts = query ? await getProducts({ search: query, limit: 48 }) : [];
  // DEMO DATA — remove before production: fall back to the demo catalog
  // only when the storefront has no real products at all (probe fetch).
  const storefrontEmpty = query
    ? (await getProducts({ limit: 1 })).length === 0
    : false;
  const products =
    storefrontEmpty && realProducts.length === 0
      ? searchDemoProducts(query)
      : realProducts;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black">
        {query ? (
          <>Results for &ldquo;{query}&rdquo;</>
        ) : (
          "Search products"
        )}
      </h1>

      {!query ? (
        <div className="mt-6">
          <form action="/search" method="get" role="search" className="sm:hidden">
            <input
              type="search"
              name="q"
              placeholder="Search for groceries, vegetables, snacks…"
              aria-label="Search products"
              autoFocus
              className="w-full px-5 py-3.5 rounded-full bg-slate-100 border-0 text-base focus:ring-2 focus:ring-green-500 focus:bg-white transition"
            />
          </form>
          <p className="mt-6 text-center text-slate-500">
            Type above to find groceries and essentials.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 text-center py-16">
          <SearchX className="w-12 h-12 mx-auto mb-4 text-slate-300" aria-hidden="true" />
          <p className="text-xl font-bold">No results for &ldquo;{query}&rdquo;</p>
          <p className="mt-2 text-slate-500">
            Try a different spelling or browse categories instead.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
          >
            Back to home
          </a>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
