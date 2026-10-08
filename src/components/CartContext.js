"use client";

import { useSyncExternalStore, useCallback } from "react";

// External store — SSR-safe, no context needed
let items = [];
let listeners = [];

function emit() {
  listeners.forEach((l) => l());
  try {
    localStorage.setItem("xyvot-cart", JSON.stringify(items));
  } catch {}
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return items;
}

function getServerSnapshot() {
  return [];
}

// Hydrate from localStorage on client
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("xyvot-cart");
    if (saved) items = JSON.parse(saved);
  } catch {}
}

export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((product, variant = null, qty = 1) => {
    const key = variant ? `${product.id}__${variant.id}` : String(product.id);
    const price = Number(
      variant?.selling_price ?? variant?.price ?? product.selling_price ?? product.price ?? 0
    );
    const existing = items.find((i) => i.key === key);
    if (existing) {
      items = items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
    } else {
      items = [
        ...items,
        {
          key,
          productId: product.id,
          title: product.title || product.name,
          image: product.image_url || product.image,
          variantLabel: variant?.label || variant?.name || null,
          price,
          qty,
        },
      ];
    }
    emit();
  }, []);

  const updateQty = useCallback((key, qty) => {
    items =
      qty <= 0
        ? items.filter((i) => i.key !== key)
        : items.map((i) => (i.key === key ? { ...i, qty } : i));
    emit();
  }, []);

  const removeItem = useCallback((key) => {
    items = items.filter((i) => i.key !== key);
    emit();
  }, []);

  const clear = useCallback(() => {
    items = [];
    emit();
  }, []);

  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  const total = cartItems.reduce((n, i) => n + i.price * i.qty, 0);

  return { items: cartItems, addItem, updateQty, removeItem, clear, count, total };
}

// No-op provider for compatibility — not needed with external store
export function CartProvider({ children }) {
  return children;
}
