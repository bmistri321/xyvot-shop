"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

const CATEGORIES = [
  "Food & beverages",
  "Clothing & fashion",
  "Electronics & appliances",
  "Beauty & personal care",
  "Health & wellness",
  "Home & kitchen",
  "Furniture & décor",
  "Automotive & accessories",
  "Sports & fitness",
  "Toys & games",
  "Books & stationery",
  "Jewelry & watches",
  "Baby & kids' products",
  "Pet products",
  "Industrial & business products",
  "Agriculture & Gardening",
  "Construction & Hardware",
  "Travel & Luggage",
];

function useColumns() {
  const [cols, setCols] = useState(9);
  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqSm = window.matchMedia("(min-width: 640px)");
    const update = () =>
      setCols(mqLg.matches ? 9 : mqSm.matches ? 6 : 3);
    update();
    mqLg.addEventListener("change", update);
    mqSm.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqSm.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

function ExpansionPanel({ category, onClose }) {
  const [products, setProducts] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    fetch(`/api/category-preview?name=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div
      ref={panelRef}
      id={`category-panel-${category}`}
      role="region"
      aria-label={`${category} preview`}
      className="col-span-full rounded-[2rem] bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-6 sm:p-10 scroll-mt-24"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {category}
        </h3>
        <div className="flex items-center gap-4">
          <a
            href={`/category/${encodeURIComponent(category)}`}
            className="text-sm sm:text-base font-bold text-white border-b-2 border-white/60 hover:border-white pb-0.5 transition-colors"
          >
            View all →
          </a>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {products === null ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          aria-hidden="true"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-white/15 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg font-bold text-white">No products yet</p>
          <p className="mt-2 text-purple-200">
            Shops are stocking this shelf — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryGrid() {
  const [selected, setSelected] = useState(null);
  const cols = useColumns();

  const toggle = useCallback(
    (name) => setSelected((prev) => (prev === name ? null : name)),
    []
  );

  const selectedIdx = selected ? CATEGORIES.indexOf(selected) : -1;
  // Insert the panel right after the selected tile's row
  const panelAfter =
    selectedIdx >= 0
      ? Math.min(
          Math.floor(selectedIdx / cols) * cols + cols,
          CATEGORIES.length
        )
      : -1;

  const tiles = [];
  CATEGORIES.forEach((name, i) => {
    const isSelected = name === selected;
    tiles.push(
      <button
        key={name}
        onClick={() => toggle(name)}
        aria-expanded={isSelected}
        aria-controls={isSelected ? `category-panel-${name}` : undefined}
        className="group flex flex-col items-center gap-2 focus:outline-none"
      >
        <span
          className={`w-full aspect-[4/5] rounded-2xl bg-white border-2 transition-all flex items-center justify-center ${
            isSelected
              ? "border-purple-600 shadow-lg shadow-purple-600/20"
              : "border-lime-400 group-hover:border-lime-500 group-hover:shadow-md"
          }`}
        >
          <span
            className={`text-[11px] font-semibold px-2 text-center leading-tight ${
              isSelected ? "text-purple-700" : "text-lime-900/60"
            }`}
            aria-hidden="true"
          >
            {name}
          </span>
        </span>
        <span
          className={`text-xs sm:text-[13px] font-semibold text-center leading-tight transition-colors ${
            isSelected ? "text-purple-700" : "text-[#4a521f]"
          }`}
        >
          {name}
        </span>
      </button>
    );
    if (i + 1 === panelAfter) {
      tiles.push(
        <ExpansionPanel
          key={`panel-${selected}`}
          category={selected}
          onClose={() => setSelected(null)}
        />
      );
    }
  });

  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-4 sm:gap-5"
      role="list"
      aria-label="Shop by category"
    >
      {tiles}
    </div>
  );
}
