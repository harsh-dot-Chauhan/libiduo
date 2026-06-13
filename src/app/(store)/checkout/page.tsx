"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useCartStore } from "@/store/cart-store";
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/validations/order";
import type { Resolver } from "react-hook-form";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "rgba(13,6,8,0.6)",
  border: "0.5px solid rgba(201,151,58,0.3)", color: TEXT,
  padding: "12px 16px", borderRadius: 10, fontSize: 13, outline: "none",
  marginTop: 6,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, total, fetchCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchCart(); }, [fetchCart]);
  useEffect(() => { if (status === "unauthenticated") router.push("/login?callbackUrl=/checkout"); }, [status, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<PlaceOrderInput>({
    resolver: zodResolver(placeOrderSchema) as Resolver<PlaceOrderInput>,
    defaultValues: { paymentMethod: "COD" },
  });

  const onSubmit = async (data: PlaceOrderInput) => {
    setSubmitting(true); setError(null);
    try {
      const res = await axios.post<{ success: boolean; data: { id: string } }>("/api/orders", data);
      if (res.data.success) router.push(`/orders/${res.data.data.id}?placed=1`);
    } catch (e) {
      setError(axios.isAxiosError(e) ? (e.response?.data?.error ?? "Something went wrong") : "Something went wrong");
    } finally { setSubmitting(false); }
  };

  if (status === "loading") return null;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Your cart is empty</p>
        <Link href="/products" style={{ marginTop: 16, color: GOLD, fontSize: 13, textDecoration: "none" }}>Browse products</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Complete your</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: TEXT, marginBottom: 32 }}>Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="lg:grid-cols-[1fr_380px]">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Shipping */}
            <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>📍 Shipping Address</h2>

              {error && <p style={{ background: "rgba(107,26,42,0.3)", border: "0.5px solid rgba(107,26,42,0.5)", color: "#E8A0A8", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</p>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Full name</label>
                  <input {...register("shippingAddress.name")} style={inputStyle} />
                  {errors.shippingAddress?.name && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.name.message}</p>}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Mobile number</label>
                  <input {...register("shippingAddress.phone")} type="tel" style={inputStyle} placeholder="10-digit mobile" />
                  {errors.shippingAddress?.phone && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.phone.message}</p>}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address line 1</label>
                  <input {...register("shippingAddress.line1")} style={inputStyle} placeholder="House no., building, street" />
                  {errors.shippingAddress?.line1 && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.line1.message}</p>}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address line 2 <span style={{ color: "#6B5A50" }}>(optional)</span></label>
                  <input {...register("shippingAddress.line2")} style={inputStyle} placeholder="Area, colony, landmark" />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input {...register("shippingAddress.city")} style={inputStyle} />
                  {errors.shippingAddress?.city && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.city.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Pincode</label>
                  <input {...register("shippingAddress.pincode")} style={inputStyle} placeholder="6-digit pincode" maxLength={6} />
                  {errors.shippingAddress?.pincode && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.pincode.message}</p>}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>State</label>
                  <select {...register("shippingAddress.state")} style={{ ...inputStyle, color: MUTED }}>
                    <option value="" style={{ background: MID }}>Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s} style={{ background: MID, color: TEXT }}>{s}</option>)}
                  </select>
                  {errors.shippingAddress?.state && <p style={{ fontSize: 11, color: "#E8A0A8", marginTop: 4 }}>{errors.shippingAddress.state.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>🚚 Payment Method</h2>
              <label style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(107,26,42,0.25)", border: `1px solid ${BUR}`, borderRadius: 12, padding: 16, cursor: "pointer" }}>
                <input {...register("paymentMethod")} type="radio" value="COD" defaultChecked style={{ accentColor: GOLD }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Cash on Delivery</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Pay when your order arrives</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24, height: "fit-content", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD }}>Order Summary</h2>
            <ul style={{ listStyle: "none", maxHeight: 256, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
              {items.map((item) => (
                <li key={item.productId} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}>
                  <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0, overflow: "hidden", borderRadius: 8, background: BUR }}>
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: GOLD, flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: "0.5px solid rgba(201,151,58,0.15)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: MUTED }}>
                <span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: MUTED }}>
                <span>Shipping</span><span style={{ color: "#86EFAC" }}>Free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                <span style={{ color: TEXT }}>Total</span><span style={{ color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ background: submitting ? BUR : GOLD, color: submitting ? TEXT : DARK, border: "none", borderRadius: 40, padding: "14px 0", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Placing order…" : "Place Order"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: MUTED }}>Cash on Delivery — pay when delivered</p>
          </div>
        </form>
      </div>
    </div>
  );
}
