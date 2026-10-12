import { notFound } from "next/navigation";
import { getProducts } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import SubcategoryPills from "@/components/SubcategoryPills";

export async function generateMetadata({ params }) {
  const { name, sub } = await params;
  const category = decodeURIComponent(name);
  const subcategory = decodeURIComponent(sub);
  return {
    title: `${subcategory} — ${category} — Shop online`,
    description: `Buy ${subcategory} online with 15-minute delivery from Xyvot Shop.`,
    alternates: {
      canonical: `https://shop.xyvot.com/category/${name}/${sub}`,
    },
  };
}

// Matches a product to a subcategory slug/name across likely field shapes.
function matchesSubcategory(p, sub) {
  const needle = sub.toLowerCase().replace(/-/g, " ");
  const fields = [p.subcategory, p.sub_category, p.subCategory];
  return fields.some(
    (f) => f && String(f).toLowerCase().replace(/-/g, " ") === needle
  );
}

export default async function SubcategoryPage({ params }) {
  const { name, sub } = await params;
  const category = decodeURIComponent(name);
  const subcategory = decodeURIComponent(sub);

  // Pull the parent category's products, then narrow to the subcategory.
  // If products carry no subcategory field, fall back to the full list
  // rather than showing an empty page.
  const all = await getProducts({ category, limit: 100 });
  const narrowed = all.filter((p) => matchesSubcategory(p, subcategory));
  const products = narrowed.length > 0 || all.length === 0 ? narrowed : all;
  const isFallback = narrowed.length === 0 && all.length > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex gap-2 flex-wrap">
          <li><a href="/" className="hover:text-slate-900">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href={`/category/${name}`} className="hover:text-slate-900">{category}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">{subcategory}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-black">{subcategory}</h1>
      <SubcategoryPills parent={category} />

      {isFallback && (
        <p className="mt-4 p-4 rounded-2xl bg-amber-50 text-amber-800 text-sm font-medium">
          Showing all {category} products — subcategory filtering isn&apos;t available for these items yet.
        </p>
      )}

      {products.length === 0 ? (
        <div className="mt-8 text-center py-16">
          <p className="text-xl font-bold">No products in {subcategory} yet</p>
          <p className="mt-2 text-slate-500">Check back soon — shops are stocking up.</p>
          <a
            href={`/category/${name}`}
            className="mt-6 inline-block px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
          >
            Browse {category}
          </a>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {products.length} {products.length === 1 ? "product" : "products"}
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
