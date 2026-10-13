"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/components/CartContext";

export default function AddToCartButton({ product, inStock }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const variants = product.variants || [];
  const [selected, setSelected] = useState(variants[0] || null);

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-full bg-slate-200 text-slate-500 font-bold cursor-not-allowed"
      >
        Out of stock
      </button>
    );
  }

  const handleAdd = () => {
    addItem(product, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      {variants.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold mb-2">Choose option:</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id || v.label}
                onClick={() => setSelected(v)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
                  selected?.id === v.id || selected?.label === v.label
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:border-slate-400"
                }`}
                aria-pressed={selected?.id === v.id}
              >
                {v.label || v.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={handleAdd}
        className={`w-full py-4 rounded-full font-bold text-lg transition ${
          added
            ? "bg-emerald-600 text-white"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {added ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Check className="w-5 h-5" aria-hidden="true" /> Added to cart
          </span>
        ) : (
          "Add to cart"
        )}
      </button>
    </div>
  );
}
