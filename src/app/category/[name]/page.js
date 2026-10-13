import { notFound } from "next/navigation";
import { getProducts } from "@/lib/supabase";
// DEMO DATA — remove before production.
import { getDemoProductsByCategory } from "@/data/demoProducts";
import ProductCard from "@/components/ProductCard";
import GroceryProductCard from "@/components/GroceryProductCard";
import SubcategoryPills from "@/components/SubcategoryPills";

export async function generateMetadata({ params }) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  return {
    title: `${category} — Shop online`,
    description: `Buy ${category} online with 15-minute delivery from Xyvot Shop.`,
    alternates: { canonical: `https://shop.xyvot.com/category/${name}` },
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  const realProducts = await getProducts({ category, limit: 48 });
  // DEMO DATA — remove before production: fall back to the demo catalog
  // only when the storefront has no real products at all (probe fetch).
  const storefrontEmpty = (await getProducts({ limit: 1 })).length === 0;
  const products =
    storefrontEmpty && realProducts.length === 0
      ? getDemoProductsByCategory(category)
      : realProducts;

  if (products.length === 0) {
    // Don't 404 — show honest empty state (category may exist but be empty)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-slate-900">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">{category}</li>
        </ol>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black">{category}</h1>
      <SubcategoryPills parent={category} />

      {products.length === 0 ? (
        <div className="mt-8 text-center py-16">
          <p className="text-xl font-bold">No products in {category} yet</p>
          <p className="mt-2 text-slate-500">Check back soon — shops are stocking up.</p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
          >
            Browse all products
          </a>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          {/* Mobile: grocery card, 3-up — matches home */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden">
            {products.map((p) => (
              <GroceryProductCard key={p.id} product={p} />
            ))}
          </div>
          {/* Desktop: classic card */}
          <div className="mt-6 hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
