"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Fetches subcategories for a parent category and renders them as pills.
// Renders nothing if the category has no subcategories — the category
// page then works exactly as before.
export default function SubcategoryPills({ parent }) {
  const [subs, setSubs] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/subcategories?parent=${encodeURIComponent(parent)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setSubs(d.ok ? d.data || [] : []);
      })
      .catch(() => {
        if (!cancelled) setSubs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [parent]);

  if (!subs || subs.length === 0) return null;

  return (
    <nav aria-label="Subcategories" className="mt-4">
      <ul className="flex flex-wrap gap-2">
        {subs.map((s) => (
          <li key={s.slug || s.name}>
            <Link
              href={`/category/${encodeURIComponent(parent)}/${encodeURIComponent(s.slug || s.name)}`}
              className="inline-block px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-sm font-bold text-purple-800 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
