"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Category = { id: string; name: string; slug: string };

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: undefined },
];

const GOLD = "#C9973A";
const MUTED = "#B8A99A";
const TEXT = "#F0E6D3";

export default function FilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeMin = searchParams.get("minPrice") ?? "";
  const activeMax = searchParams.get("maxPrice") ?? "";

  const updateParam = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = () => router.push("/products");
  const hasFilters = activeCategory || activeMin || activeMax;

  const labelStyle = (active: boolean) => ({
    fontSize: 13, cursor: "pointer", background: "none", border: "none",
    color: active ? GOLD : MUTED,
    fontWeight: active ? 600 : 400,
    letterSpacing: 0.5,
    padding: "4px 0",
    textAlign: "left" as const,
  });

  return (
    <aside style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: GOLD }}>Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} style={{ fontSize: 11, color: MUTED, background: "none", border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>
            Clear all
          </button>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: TEXT, marginBottom: 12, fontWeight: 500 }}>Category</h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam("category", activeCategory === cat.slug ? undefined : cat.slug)}
                style={labelStyle(activeCategory === cat.slug)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: TEXT, marginBottom: 12, fontWeight: 500 }}>Price Range</h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {PRICE_RANGES.map((range) => {
            const isActive = activeMin === String(range.min) && (range.max === undefined ? !activeMax : activeMax === String(range.max));
            return (
              <li key={range.label}>
                <button
                  onClick={() => {
                    if (isActive) {
                      const p = new URLSearchParams(searchParams.toString());
                      p.delete("minPrice"); p.delete("maxPrice"); p.delete("page");
                      router.push(`/products?${p.toString()}`);
                    } else {
                      const p = new URLSearchParams(searchParams.toString());
                      p.set("minPrice", String(range.min));
                      range.max !== undefined ? p.set("maxPrice", String(range.max)) : p.delete("maxPrice");
                      p.delete("page");
                      router.push(`/products?${p.toString()}`);
                    }
                  }}
                  style={labelStyle(isActive)}
                >
                  {range.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
