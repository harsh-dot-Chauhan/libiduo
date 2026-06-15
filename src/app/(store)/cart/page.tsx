"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus, Plus, Trash2, Tag, ChevronRight,
  ChevronDown, Ticket, Lock, Package, RefreshCw, CheckCircle,
  XCircle, Gift,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";

// ─── theme ─────────────────────────────────────────────────────────────────────
const css = {
  "--bur":  "#6B1A2A",
  "--bur-l":"#8B2A3E",
  "--bur-d":"#3C0A14",
  "--gold": "#C9973A",
  "--gold-l":"#E8B84B",
  "--cream":"#F5EDD8",
  "--dark": "#0D0608",
  "--mid":  "#1A0C10",
  "--mid2": "#251018",
  "--text": "#F0E6D3",
  "--muted":"#B8A99A",
  "--border":"rgba(201,151,58,0.2)",
  "--green":"#7CBA5A",
  "--red":  "#E05050",
} as React.CSSProperties;


type RecoProduct = {
  id: string; name: string; slug: string;
  price: string; images: string;
};

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const msgs = ["Free Shipping above ₹999","Discreet Packaging","100% Body Safe","Easy Returns","COD Available"];
  const inner = [...msgs, ...msgs].map((m, i) =>
    <span key={i} style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--cream)", margin: "0 12px" }}>
      {m} <span style={{ color: "var(--gold)", margin: "0 4px" }}>✦</span>
    </span>
  );
  return (
    <div style={{ background: "var(--bur)", padding: "9px 0", overflow: "hidden", whiteSpace: "nowrap", borderBottom: "0.5px solid var(--border)" }}>
      <div style={{ display: "inline-block", animation: "marquee 18s linear infinite" }}>{inner}</div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
function TrustRow() {
  const items = [
    { icon: <Lock size={18} />, title: "100% Secure", sub: "SSL encrypted" },
    { icon: <Package size={18} />, title: "Discreet Box", sub: "Plain packaging" },
    { icon: <RefreshCw size={18} />, title: "Easy Returns", sub: "7 day policy" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "0 16px 24px" }}>
      {items.map((t) => (
        <div key={t.title} style={{ background: "var(--mid)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
          <div style={{ color: "var(--gold)", marginBottom: 6 }}>{t.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text)" }}>{t.title}</div>
          <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, total, count, fetchCart, updateItem, removeItem } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [couponAmt, setCouponAmt] = useState(0);
  const [couponOpen, setCouponOpen] = useState(true);
  const [giftWrap, setGiftWrap] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recos, setRecos] = useState<RecoProduct[]>([]);
  const [publicCoupons, setPublicCoupons] = useState<{ code: string; discountPct: number }[]>([]);
  const couponRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPublicCoupons(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products?limit=6")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const cartIds = new Set(items.map((i) => i.productId));
          setRecos((d.data.products as RecoProduct[]).filter((p) => !cartIds.has(p.id)).slice(0, 4));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function applyCoupon(code = couponCode) {
    const upper = code.trim().toUpperCase();
    if (!upper) return;
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: upper }),
      });
      const json = await res.json();
      if (json.success) {
        const amt = Math.round(total * json.data.pct / 100);
        setCouponAmt(amt);
        setCouponResult({ ok: true, msg: `${json.data.label} (−₹${amt.toLocaleString("en-IN")})` });
        showToast("Coupon applied successfully!");
      } else {
        setCouponAmt(0);
        setCouponResult({ ok: false, msg: json.error ?? "Invalid coupon code" });
      }
    } catch {
      setCouponAmt(0);
      setCouponResult({ ok: false, msg: "Could not validate coupon. Try again." });
    }
  }

  const gwAmt  = giftWrap ? 99 : 0;
  const grandTotal = total - couponAmt + gwAmt;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={css}>
        <Marquee />
        <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontFamily: "var(--font-playfair,serif)", fontSize: 24, color: "var(--text)", marginBottom: 10 }}>Your cart is empty</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
            Looks like you haven&apos;t added anything yet.<br />Let&apos;s fix that!
          </p>
          <Link href="/products" style={{ background: "var(--gold)", color: "var(--dark)", borderRadius: 40, padding: "14px 36px", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...css, minHeight: "100vh", background: "var(--dark)", color: "var(--text)", fontFamily: "Inter,sans-serif", paddingBottom: 140 }}>
      <Marquee />

      {/* Breadcrumb */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: "0.5px solid var(--border)" }}>
        {[["Home", "/"], ["Shop", "/products"]].map(([label, href]) => (
          <span key={href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href={href} style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none" }}>{label}</Link>
            <ChevronRight size={10} color="rgba(184,169,154,0.4)" />
          </span>
        ))}
        <span style={{ fontSize: 11, color: "var(--gold)" }}>Cart</span>
      </div>

      {/* Coupon banner */}
      <div
        onClick={() => couponRef.current?.scrollIntoView({ behavior: "smooth" })}
        style={{ margin: "16px 16px 0", background: "rgba(107,26,42,0.2)", border: "0.5px dashed rgba(201,151,58,0.4)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <Tag size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gold)" }}>Have a coupon code? Save on your order!</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Tap to apply coupon code</div>
        </div>
        <ChevronRight size={16} color="var(--muted)" />
      </div>

      {/* Cart items */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
          Your Cart ({count} {count === 1 ? "item" : "items"})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const firstImg = (() => { try { const p = JSON.parse(item.image); return Array.isArray(p) ? p[0] : item.image; } catch { return item.image; } })();
            return (
              <div key={item.productId} style={{ background: "var(--mid)", border: "0.5px solid var(--border)", borderRadius: 16, padding: 14, display: "flex", gap: 14 }}>
                {/* Image */}
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: "var(--bur-d)", flexShrink: 0, position: "relative" }}>
                  {firstImg
                    ? <Image src={firstImg} alt={item.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                    : <span style={{ fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🛍️</span>
                  }
                </div>
                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.slug}`} style={{ fontFamily: "var(--font-playfair,serif)", fontSize: 15, color: "var(--text)", textDecoration: "none", display: "block", marginBottom: 4 }}>
                    {item.name}
                  </Link>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Qty: {item.quantity}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "var(--gold)" }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>₹{item.price.toLocaleString("en-IN")} each</span>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "0.5px solid var(--border)", borderRadius: 40, overflow: "hidden" }}>
                      <button
                        onClick={() => updateItem(item.productId, item.quantity - 1)}
                        style={{ width: 30, height: 30, background: "none", border: "none", color: "var(--gold)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-label="Decrease"
                      ><Minus size={14} /></button>
                      <span style={{ width: 32, textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        style={{ width: 30, height: 30, background: "none", border: "none", color: "var(--gold)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: item.quantity >= item.stock ? 0.4 : 1 }}
                        aria-label="Increase"
                      ><Plus size={14} /></button>
                    </div>
                    <button
                      onClick={() => { removeItem(item.productId); showToast("Item removed"); }}
                      style={{ background: "none", border: "none", color: "rgba(184,169,154,0.5)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
                      aria-label="Remove"
                    ><Trash2 size={17} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free gift */}
      {total >= 999 && (
        <div style={{ margin: "20px 16px 0", background: "linear-gradient(135deg,rgba(107,26,42,0.3),rgba(60,10,20,0.3))", border: "0.5px solid rgba(201,151,58,0.3)", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, background: "var(--bur-d)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Gift size={22} color="var(--gold)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gold)", marginBottom: 3 }}>You&apos;ve unlocked a free gift!</div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>A LIBIDUO rose petal sachet will be added to your order</div>
          </div>
          <span style={{ background: "var(--gold)", color: "var(--dark)", fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5, whiteSpace: "nowrap" }}>FREE</span>
        </div>
      )}

      {/* Recommended */}
      {recos.length > 0 && (
        <div style={{ marginTop: 24, paddingLeft: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>You May Also Like</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingRight: 16, scrollbarWidth: "none" }}>
            {recos.map((p) => {
              const img = (() => { try { const arr = JSON.parse(p.images); return Array.isArray(arr) ? arr[0] : p.images; } catch { return p.images; } })();
              return (
                <div key={p.id} style={{ background: "var(--mid)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden", flexShrink: 0, width: 130 }}>
                  <div style={{ height: 100, position: "relative", background: "linear-gradient(135deg,var(--bur-d),var(--mid2))" }}>
                    {img && <Image src={img} alt={p.name} fill sizes="130px" style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                  </div>
                  <Link
                    href={`/products/${p.slug}`}
                    style={{ display: "block", width: "100%", background: "var(--bur)", color: "var(--cream)", textAlign: "center", padding: "6px 0", fontSize: 10, textDecoration: "none", letterSpacing: 0.5 }}
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon input */}
      <div ref={couponRef} style={{ margin: "20px 16px 0", background: "var(--mid)", border: "0.5px solid var(--border)", borderRadius: 14, padding: 16 }}>
        <button
          onClick={() => setCouponOpen((o) => !o)}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: couponOpen ? 14 : 0, color: "inherit" }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <Ticket size={16} color="var(--gold)" /> Apply Coupon
          </span>
          <ChevronDown size={16} color="var(--muted)" style={{ transform: couponOpen ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
        </button>
        {couponOpen && (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                style={{ flex: 1, background: "var(--mid2)", border: "0.5px solid var(--border)", borderRadius: 40, padding: "10px 16px", color: "var(--text)", fontSize: 13, fontFamily: "inherit", outline: "none", letterSpacing: 1 }}
              />
              <button
                onClick={() => applyCoupon()}
                style={{ background: "var(--gold)", color: "var(--dark)", border: "none", padding: "10px 20px", borderRadius: 40, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >Apply</button>
            </div>
            {couponResult && (
              <div style={{ marginTop: 10, fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: couponResult.ok ? "var(--green)" : "var(--red)" }}>
                {couponResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {couponResult.msg}
              </div>
            )}
            {publicCoupons.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {publicCoupons.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCouponCode(c.code); applyCoupon(c.code); }}
                    style={{ padding: "6px 12px", border: "0.5px dashed rgba(201,151,58,0.4)", borderRadius: 20, fontSize: 11, color: "var(--gold)", cursor: "pointer", background: "none", letterSpacing: 0.5 }}
                  >
                    {c.code} — {c.discountPct}% off
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order summary */}
      <div style={{ margin: "20px 16px 0", background: "var(--mid)", border: "0.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "0.5px solid var(--border)", fontFamily: "var(--font-playfair,serif)", fontSize: 18, color: "var(--text)" }}>Order Summary</div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: `Subtotal (${count} ${count === 1 ? "item" : "items"})`, val: `₹${total.toLocaleString("en-IN")}`, color: "var(--text)" },
            { label: "Delivery", val: "FREE", color: "var(--green)" },
            { label: "Coupon discount", val: couponAmt > 0 ? `−₹${couponAmt.toLocaleString("en-IN")}` : "−₹0", color: couponAmt > 0 ? "var(--green)" : "var(--text)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
              <span style={{ fontSize: 13, color }}>{val}</span>
            </div>
          ))}
          <div style={{ height: 0.5, background: "var(--border)", margin: "4px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Gift wrap</span>
            <button
              onClick={() => { setGiftWrap((g) => !g); showToast(giftWrap ? "Gift wrap removed" : "Gift wrap added!"); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: giftWrap ? "var(--green)" : "var(--gold)", fontFamily: "inherit" }}
            >{giftWrap ? "✓ Added (₹99)" : "+ Add ₹99"}</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderTop: "0.5px solid var(--border)", background: "rgba(201,151,58,0.05)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Total</div>
            {couponAmt > 0 && (
              <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>
                You&apos;re saving ₹{couponAmt.toLocaleString("en-IN")} on this order!
              </div>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-playfair,serif)", fontSize: 24, color: "var(--gold)", fontWeight: 700 }}>
            ₹{grandTotal.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Trust */}
      <div style={{ marginTop: 20 }}>
        <TrustRow />
      </div>

      {/* Sticky footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(13,6,8,0.97)", borderTop: "0.5px solid var(--border)", padding: "12px 16px", zIndex: 200, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Total payable</div>
              {couponAmt > 0 && <div style={{ fontSize: 11, color: "var(--green)" }}>You save ₹{couponAmt.toLocaleString("en-IN")}</div>}
            </div>
            <div style={{ fontFamily: "var(--font-playfair,serif)", fontSize: 20, color: "var(--gold)", fontWeight: 700 }}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/products"
              style={{ background: "transparent", color: "var(--muted)", border: "0.5px solid var(--border)", padding: "13px 20px", borderRadius: 40, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none", display: "flex", alignItems: "center" }}
            >← Shop more</Link>
            <Link
              href="/checkout"
              style={{ flex: 1, background: "var(--gold)", color: "var(--dark)", border: "none", padding: "13px 0", borderRadius: 40, fontSize: 13, fontWeight: 600, letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
            >
              <Lock size={14} /> Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "var(--mid)", border: "0.5px solid var(--gold)", borderRadius: 40, padding: "10px 20px", fontSize: 12, color: "var(--gold)", letterSpacing: 1, zIndex: 500, whiteSpace: "nowrap", pointerEvents: "none" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
