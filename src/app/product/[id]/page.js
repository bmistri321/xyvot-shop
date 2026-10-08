import { notFound } from "next/navigation";
import { getProduct, formatPrice, discountPercent } from "@/lib/supabase";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };

  const title = product.title || product.name || "Product";
  const price = Number(product.selling_price ?? product.price ?? 0);
  const description = product.description
    ? product.description.slice(0, 155)
    : `${title} — buy online at ${formatPrice(price)} with 15-minute delivery from Xyvot.`;

  return {
    title,
    description,
    alternates: { canonical: `https://shop.xyvot.com/product/${id}` },
    openGraph: {
      title: `${title} | Xyvot Shop`,
      description,
      type: "website",
      images: product.image_url || product.image ? [product.image_url || product.image] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const title = product.title || product.name || "Product";
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const off = discountPercent(product);
  const inStock = Number(product.stock ?? product.stock_quantity ?? 0) > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: product.description || title,
    image: product.image_url || product.image || undefined,
    category: product.category || undefined,
    offers: {
      "@type": "Offer",
      url: `https://shop.xyvot.com/product/${id}`,
      priceCurrency: "INR",
      price: price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-slate-900">Home</a></li>
          <li aria-hidden="true">/</li>
          {product.category && (
            <>
              <li>
                <a
                  href={`/category/${encodeURIComponent(product.category)}`}
                  className="hover:text-slate-900"
                >
                  {product.category}
                </a>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="text-slate-900 font-medium truncate">
            {title}
          </li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductImage
          src={product.image_url || product.image}
          alt={title}
        />

        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{title}</h1>
          {product.category && (
            <p className="mt-2 text-sm text-slate-500">{product.category}</p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black">{formatPrice(price)}</span>
            {mrp > price && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(mrp)}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <p className={`mt-4 text-sm font-semibold ${inStock ? "text-emerald-700" : "text-red-600"}`}>
            {inStock ? "● In stock" : "● Out of stock"}
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-bold mb-2">Description</h2>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} inStock={inStock} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-2xl p-4">
              <dt className="font-bold">Delivery</dt>
              <dd className="mt-1 text-slate-600">~15 minutes</dd>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <dt className="font-bold">Returns</dt>
              <dd className="mt-1 text-slate-600">Easy replacement</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
