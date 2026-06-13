"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const BUR = "#6B1A2A";
const CREAM = "#F5EDD8";
const MUTED = "#B8A99A";
const MID = "#1A0C10";

type CartProduct = { id: string; name: string; price: number; image: string; stock: number };

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const [qty, setQty] = useState(1);
  const { addItem, loading } = useCartStore();

  if (product.stock === 0) {
    return (
      <button disabled style={{ width: "100%", borderRadius: 40, padding: "13px 0", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", background: "rgba(107,26,42,0.3)", color: MUTED, border: "0.5px solid rgba(107,26,42,0.4)", cursor: "not-allowed" }}>
        Sold Out
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Qty picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Qty</span>
        <div style={{ display: "flex", alignItems: "center", border: "0.5px solid rgba(201,151,58,0.3)", borderRadius: 8 }}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 32, height: 32, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <span style={{ padding: "0 12px", fontSize: 14, color: CREAM, minWidth: 32, textAlign: "center" }}>{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={{ width: 32, height: 32, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={() => addItem(product.id, qty)}
        disabled={loading}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          borderRadius: 40, padding: "13px 0",
          background: loading ? BUR : GOLD, color: loading ? CREAM : DARK,
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
          opacity: loading ? 0.7 : 1, transition: "all 0.2s",
        }}
      >
        <ShoppingCart size={16} />
        {loading ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
}
