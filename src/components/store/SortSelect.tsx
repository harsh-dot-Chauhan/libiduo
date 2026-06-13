"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      style={{
        background: "#1A0C10",
        border: "0.5px solid rgba(201,151,58,0.35)",
        color: "#B8A99A",
        padding: "7px 12px",
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: 0.5,
        outline: "none",
        cursor: "pointer",
      }}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: "#1A0C10", color: "#F0E6D3" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
