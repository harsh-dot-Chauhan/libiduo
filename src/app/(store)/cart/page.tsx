"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

export default function CartPage() {
  const { items, total, count, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <ShoppingBag size={56} strokeWidth={1.5} color={MUTED} />
        <h1 style={{ marginTop: 16, fontSize: 20, fontWeight: 600, color: TEXT }}>Your cart is empty</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: MUTED }}>Add items from the store to get started.</p>
        <Link href="/products" style={{ marginTop: 24, background: GOLD, color: DARK, borderRadius: 40, padding: "13px 32px", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Your</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: TEXT, marginBottom: 32 }}>
          Cart ({count} {count === 1 ? "item" : "items"})
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="lg:grid-cols-3-custom">
          {/* Items */}
          <ul style={{ gridColumn: "span 2", listStyle: "none", display: "flex", flexDirection: "column" }}>
            {items.map((item) => (
              <li key={item.productId} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "0.5px solid rgba(201,151,58,0.12)" }}>
                <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0, overflow: "hidden", borderRadius: 10, background: BUR }}>
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.slug}`} style={{ fontSize: 14, fontWeight: 500, color: TEXT, textDecoration: "none" }}>
                    {item.name}
                  </Link>
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>₹{item.price.toLocaleString("en-IN")} each</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", border: "0.5px solid rgba(201,151,58,0.3)", borderRadius: 8 }}>
                      <button onClick={() => updateItem(item.productId, item.quantity - 1)} style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                      <span style={{ fontSize: 13, color: TEXT, padding: "0 10px" }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", opacity: item.quantity >= item.stock ? 0.4 : 1 }}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: MUTED }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p style={{ flexShrink: 0, fontSize: 14, fontWeight: 600, color: GOLD }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24, height: "fit-content", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: TEXT, letterSpacing: 1, textTransform: "uppercase" }}>Order Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED }}>
              <span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED }}>
              <span>Shipping</span><span style={{ color: "#5B9B6B" }}>Free</span>
            </div>
            <div style={{ borderTop: "0.5px solid rgba(201,151,58,0.2)", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: TEXT }}>Total</span><span style={{ color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <Link href="/checkout" style={{ display: "block", background: GOLD, color: DARK, borderRadius: 40, padding: "13px 0", textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
              Proceed to Checkout
            </Link>
            <Link href="/products" style={{ display: "block", textAlign: "center", fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
