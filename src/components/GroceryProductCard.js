"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, Package } from "lucide-react";
import { useCart } from "./CartContext";
import QuantityStepper from "./QuantityStepper";
import { formatPrice, discountPercent } from "@/lib/supabase";

// Blinkit/Zepto-style product card (mobile): image with wishlist heart,
// outlined ADD pill overlapping the image bottom edge, price + MRP +
// green discount, 2-line name, unit band.
export default function GroceryProductCard({ product }) {
  const { addItem, updateQty, items } = useCart();
  const [liked, setLiked] = useState(false);
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const off = discountPercent(product);
  const title = product.title || product.name || "Product";
  const unit = product.unit || product.category || "";

  const inCart = items.find((i) => i.key === String(product.id));
  const qty = inCart?.qty ?? 0;

  return (
    <article className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col">
      {/* Image zone (relative so the ADD pill can straddle its bottom edge) */}
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="relative aspect-square w-full bg-slate-50 overflow-hidden rounded-t-2xl block"
          aria-label={`View ${title}`}
          tabIndex={-1}
        >
          {product.image_url || product.image ? (
            <Image
              src={product.image_url || product.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-10 h-10" aria-hidden="true" />
            </div>
          )}
        </Link>

        {/* Wishlist heart — local visual toggle (no backend yet) */}
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm active:scale-90 transition"
        >
          <Heart
            className={`w-[18px] h-[18px] ${liked ? "fill-rose-500 text-rose-500" : "fill-slate-200 text-slate-400"}`}
            aria-hidden="true"
          />
        </button>

        {/* ADD pill / stepper — straddles the image bottom edge */}
        <div className="absolute right-2.5 -bottom-3.5 z-10">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="px-5 py-1.5 rounded-xl bg-white border-[1.5px] border-green-700 text-green-700 text-[13px] font-extrabold tracking-wide shadow-sm hover:bg-green-50 transition active:scale-95"
              aria-label={`Add ${title} to cart`}
            >
              ADD
            </button>
          ) : (
            <div className="bg-white border-[1.5px] border-green-700 rounded-xl shadow-sm px-1 py-0.5">
              <QuantityStepper
                size="sm"
                qty={qty}
                label={`${title} quantity`}
                onDecrement={() => updateQty(String(product.id), qty - 1)}
                onIncrement={() => addItem(product)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Unit band (light strip under the image) */}
      <div className="bg-slate-50/80 px-3 pt-4 pb-1.5 min-h-[30px]">
        {unit && (
          <p className="text-[11px] font-medium text-slate-500 truncate">{unit}</p>
        )}
      </div>

      {/* Price / name */}
      <div className="px-3 pb-3 pt-1 flex-1 flex flex-col">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[15px] font-extrabold text-slate-900">
            {formatPrice(price)}
          </span>
          {mrp > price && (
            <span className="text-[11px] text-slate-400 line-through">
              {formatPrice(mrp)}
            </span>
          )}
          {off > 0 && (
            <span className="text-[11px] font-semibold text-green-600">
              {off}% off
            </span>
          )}
        </div>
        <h3 className="mt-1 font-medium text-slate-900 text-[13px] leading-snug line-clamp-2">
          <Link
            href={`/product/${product.id}`}
            className="hover:text-green-700 transition-colors"
          >
            {title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
