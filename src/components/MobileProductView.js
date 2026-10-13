"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Share2, Star, Minus, Plus, ShoppingBag, Check, Package,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import GroceryProductCard from "@/components/GroceryProductCard";
import { formatPrice, discountPercent } from "@/lib/supabase";

function Stars({ rating }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

// Mobile-only product details — grocery-app style.
export default function MobileProductView({ product, recommendations }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shared, setShared] = useState(false);

  const title = product.title || product.name || "Product";
  const price = Number(product.selling_price ?? product.price ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const off = discountPercent(product);
  const inStock = Number(product.stock ?? product.stock_quantity ?? 0) > 0;
  const rating = product.rating;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {}
  };

  const handleAdd = () => {
    addItem(product, null, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const desc = product.description || "";
  const showToggle = desc.length > 140;
  const visibleDesc = expanded || !showToggle ? desc : `${desc.slice(0, 140)}…`;

  return (
    <div className="pb-40 bg-white text-slate-900">
      {/* Top bar */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-[15px] font-bold">Product Details</h1>
        <button
          onClick={share}
          className="w-9 h-9 -mr-2 rounded-full hover:bg-slate-100 flex items-center justify-center"
          aria-label="Share product"
        >
          {shared ? (
            <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
          ) : (
            <Share2 className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Image */}
      <div className="px-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50">
          {product.image_url || product.image ? (
            <Image
              src={product.image_url || product.image}
              alt={title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-20 h-20" aria-hidden="true" />
            </div>
          )}
          {off > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-sm">
              {off}%
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-4">
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{title}</h2>
        {rating ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
            <Stars rating={rating} />
            <span className="font-semibold text-slate-700">{Number(rating).toFixed(1)}</span>
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatPrice(price)}</span>
            {mrp > price && (
              <span className="text-sm text-slate-400 line-through">{formatPrice(mrp)}</span>
            )}
          </div>
          <div className="inline-flex items-center gap-2.5" role="group" aria-label="Quantity">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center active:scale-95 transition shadow-sm"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className={`mt-2 text-[13px] font-semibold ${inStock ? "text-green-700" : "text-red-600"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </p>

        {desc && (
          <div className="mt-4">
            <h3 className="text-[15px] font-extrabold text-slate-900">Description</h3>
            <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{visibleDesc}</p>
            {showToggle && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-1 text-[13px] font-bold text-green-700"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-extrabold text-slate-900">Recommendation</h3>
            {product.category && (
              <Link
                href={`/category/${encodeURIComponent(product.category)}`}
                className="text-[12px] font-semibold text-green-700"
              >
                See all
              </Link>
            )}
          </div>
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {recommendations.map((p) => (
              <div key={p.id} className="w-36 shrink-0">
                <GroceryProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky add-to-cart bar (covers tab bar on this screen) */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-500">Price Total</p>
            <p className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatPrice(price * qty)}
              {off > 0 && (
                <span className="ml-1.5 text-[11px] font-bold text-green-700">
                  {off}% off
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className={`flex-1 max-w-[220px] py-3.5 rounded-full font-bold text-white flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              added ? "bg-green-700" : inStock ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" aria-hidden="true" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {inStock ? "Add to Cart" : "Out of stock"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
