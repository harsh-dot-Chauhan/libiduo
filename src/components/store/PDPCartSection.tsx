"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const BUR = "#6B1A2A";
const CREAM = "#F5EDD8";
const MUTED = "#B8A99A";
const BORDER = "rgba(201,151,58,0.2)";

type Props = {
  product: { id: string; name: string; price: number; image: string; stock: number };
};

export default function PDPCartSection({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const { addItem, loading } = useCartStore();
  const router = useRouter();

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }

  async function handleAddToCart() {
    await addItem(product.id, qty);
    showToast(`${qty} item${qty > 1 ? "s" : ""} added to cart`);
  }

  async function handleBuyNow() {
    await addItem(product.id, qty);
    router.push("/checkout");
  }

  if (product.stock === 0) {
    return (
      <>
        <div style={{ marginBottom: 20 }}>
          <button disabled style={{ width: "100%", borderRadius: 40, padding: "14px 0", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", background: "rgba(107,26,42,0.3)", color: MUTED, border: "0.5px solid rgba(107,26,42,0.4)", cursor: "not-allowed" }}>
            Sold Out
          </button>
        </div>
        {/* Sticky placeholder when sold out */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(13,6,8,0.97)", borderTop: `0.5px solid ${BORDER}`, padding: "12px 16px", zIndex: 200, backdropFilter: "blur(10px)" }}>
          <button disabled style={{ width: "100%", borderRadius: 40, padding: 14, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", background: "rgba(107,26,42,0.3)", color: MUTED, border: "0.5px solid rgba(107,26,42,0.4)", cursor: "not-allowed" }}>
            Out of Stock
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Inline qty control */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: MUTED }}>Quantity:</span>
        <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${BORDER}`, borderRadius: 40, overflow: "hidden" }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease" style={{ width: 36, height: 36, background: "transparent", border: "none", color: GOLD, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <span style={{ width: 40, textAlign: "center", fontSize: 14, color: CREAM }}>{qty}</span>
          <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} aria-label="Increase" style={{ width: 36, height: 36, background: "transparent", border: "none", color: GOLD, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(13,6,8,0.97)", borderTop: `0.5px solid ${BORDER}`, padding: "12px 16px", display: "flex", gap: 10, zIndex: 200, backdropFilter: "blur(10px)" }}>
        <button onClick={handleAddToCart} disabled={loading} style={{ flex: 1, background: BUR, color: CREAM, border: "none", padding: 14, borderRadius: 40, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s", opacity: loading ? 0.7 : 1 }}>
          🛍 {loading ? "Adding…" : "Add to Cart"}
        </button>
        <button onClick={handleBuyNow} disabled={loading} style={{ flex: 1, background: GOLD, color: DARK, border: "none", padding: 14, borderRadius: 40, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.3s", opacity: loading ? 0.7 : 1 }}>
          Buy Now
        </button>
      </div>

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 88, left: "50%", transform: `translateX(-50%) translateY(${toastVisible ? 0 : 20}px)`, background: MID, border: `0.5px solid ${GOLD}`, borderRadius: 40, padding: "10px 20px", fontSize: 12, color: GOLD, letterSpacing: 1, opacity: toastVisible ? 1 : 0, transition: "all 0.3s", zIndex: 500, whiteSpace: "nowrap", pointerEvents: "none" }}>
        {toast}
      </div>
    </>
  );
}
