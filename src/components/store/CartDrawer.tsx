"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const GOLD = "#C9973A";
const MUTED = "#B8A99A";
const TEXT = "#F0E6D3";
const MID = "#1A0C10";
const DARK = "#0D0608";
const BUR = "#6B1A2A";

export default function CartDrawer() {
  const { items, total, count, isOpen, loading, closeDrawer, updateItem, removeItem, fetchCart } = useCartStore();
  const pathname = usePathname();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => { closeDrawer(); }, [pathname, closeDrawer]);

  useEffect(() => {
    function handleLinkClick(e: MouseEvent) {
      if (!isOpen) return;
      const link = (e.target as HTMLElement).closest("a");
      if (link) closeDrawer();
    }
    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, [isOpen, closeDrawer]);

  return (
    <>
      {isOpen && <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.7)" }} onClick={closeDrawer} />}

      <div style={{
        position: "fixed", inset: "0 0 0 auto", zIndex: 50,
        width: "100%", maxWidth: 380,
        display: "flex", flexDirection: "column",
        background: MID,
        borderLeft: "0.5px solid rgba(201,151,58,0.25)",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid rgba(201,151,58,0.2)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT, letterSpacing: 2, textTransform: "uppercase" }}>
            Cart {count > 0 && <span style={{ color: MUTED, fontWeight: 400 }}>({count})</span>}
          </h2>
          <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: MUTED }}>
            <ShoppingBag size={40} strokeWidth={1.5} color={MUTED} />
            <p style={{ fontSize: 13, letterSpacing: 1 }}>Your cart is empty</p>
            <button onClick={closeDrawer} style={{ fontSize: 12, color: GOLD, background: "none", border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {items.map((item) => (
                <li key={item.productId} style={{ display: "flex", gap: 12, padding: "16px 0", borderBottom: "0.5px solid rgba(201,151,58,0.1)" }}>
                  <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0, overflow: "hidden", borderRadius: 10, background: BUR }}>
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/products/${item.slug}`} onClick={closeDrawer} style={{ fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.name}
                    </Link>
                    <p style={{ fontSize: 14, fontWeight: 600, color: GOLD, marginTop: 4 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", border: "0.5px solid rgba(201,151,58,0.3)", borderRadius: 6 }}>
                        <button onClick={() => updateItem(item.productId, item.quantity - 1)} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: MUTED }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: 13, color: TEXT, width: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateItem(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: MUTED, opacity: item.quantity >= item.stock ? 0.4 : 1 }}>
                          <Plus size={11} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} style={{ marginLeft: "auto", fontSize: 11, color: MUTED, background: "none", border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ padding: "16px 20px", borderTop: "0.5px solid rgba(201,151,58,0.2)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: TEXT }}>
                <span>Subtotal</span>
                <span style={{ color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: 0.5 }}>Shipping calculated at checkout</p>
              <Link href="/checkout" onClick={closeDrawer} style={{ display: "block", width: "100%", background: GOLD, color: DARK, borderRadius: 40, padding: "13px 0", textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
                {loading ? "Loading…" : "Checkout"}
              </Link>
              <Link href="/cart" onClick={closeDrawer} style={{ display: "block", width: "100%", border: "0.5px solid rgba(201,151,58,0.4)", color: GOLD, borderRadius: 40, padding: "11px 0", textAlign: "center", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
