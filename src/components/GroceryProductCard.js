"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import { useCart } from "./CartContext";
import QuantityStepper from "./QuantityStepper";
import { formatPrice, discountPercent } from "@/lib/supabase";

// Grocery-app product card: rounded image, green discount badge,
// title, unit, price row, circular quick-add (becomes a stepper in cart).
export default function GroceryProductCard({ product }) {
  const { addItem, updateQty, items } = useCart();
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const off = discountPercent(product);
  const title = product.title || product.name || "Product";
  // DEMO DATA: demo products carry an explicit `unit` ("/pack"); real
  // products fall back to showing their category here as before.
  const unit = product.unit || product.category || "";

  const inCart = items.find((i) => i.key === String(product.id));
  const qty = inCart?.qty ?? 0;

  return (
    <article className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-square w-full bg-slate-50 overflow-hidden block"
        aria-label={`View ${title}`}
        tabIndex={-1}
      >
        {product.image_url || product.image ? (
          <Image
            src={product.image_url || product.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Package className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
        {off > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-600 text-white shadow-sm">
            {off}%
          </span>
        )}
      </Link>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-[13px] leading-snug line-clamp-2">
          <Link href={`/product/${product.id}`} className="hover:text-green-700 transition-colors">
            {title}
          </Link>
        </h3>
        {unit && <p className="mt-0.5 text-[11px] text-slate-500 truncate">{unit}</p>}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[15px] font-extrabold text-slate-900">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="text-[11px] text-slate-400 line-through">{formatPrice(mrp)}</span>
          )}
        </div>

        <div className="mt-2 flex justify-end">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition active:scale-95 shadow-sm"
              aria-label={`Add ${title} to cart`}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </button>
          ) : (
            <QuantityStepper
              size="sm"
              qty={qty}
              label={`${title} quantity`}
              onDecrement={() => updateQty(String(product.id), qty - 1)}
              onIncrement={() => addItem(product)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
