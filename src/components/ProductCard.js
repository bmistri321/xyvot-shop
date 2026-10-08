"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { formatPrice, discountPercent } from "@/lib/supabase";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const off = discountPercent(product);
  const title = product.title || product.name || "Product";

  return (
    <article className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-square w-full bg-slate-50 overflow-hidden block"
        aria-label={`View ${title}`}
      >
        {product.image_url || product.image ? (
          <Image
            src={product.image_url || product.image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {off > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-black bg-white/95 text-slate-900 shadow-sm">
            {off}% off
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
          <Link href={`/product/${product.id}`} className="hover:text-orange-700 transition-colors">
            {title}
          </Link>
        </h3>
        {product.category && (
          <p className="mt-1 text-xs text-slate-500">{product.category}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-900">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="text-sm text-slate-400 line-through">{formatPrice(mrp)}</span>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          className="mt-3 w-full py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
          aria-label={`Add ${title} to cart`}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
