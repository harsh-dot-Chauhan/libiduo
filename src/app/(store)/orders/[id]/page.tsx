export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, Truck, Home, RotateCcw } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";

type Props = { params: { id: string }; searchParams: { placed?: string } };

const STATUS_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const STEP_ICONS = [Package, CheckCircle, Truck, Home];
const STEP_LABELS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "rgba(201,151,58,0.15)",  color: "#C9973A" },
  CONFIRMED: { bg: "rgba(59,130,246,0.15)",  color: "#93C5FD" },
  SHIPPED:   { bg: "rgba(139,92,246,0.15)",  color: "#C4B5FD" },
  DELIVERED: { bg: "rgba(34,197,94,0.15)",   color: "#86EFAC" },
  CANCELLED: { bg: "rgba(107,26,42,0.3)",    color: "#E8A0A8" },
  RETURNED:  { bg: "rgba(184,169,154,0.1)",  color: "#B8A99A" },
};

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const order = await db.order.findFirst({
    where: { id: params.id, ...(session.user.role !== "ADMIN" && { userId: session.user.id }) },
    include: {
      items: { include: { product: { select: { name: true, slug: true, images: true } } } },
      payment: true,
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;
  const total = parseFloat(order.total.toString());
  const isJustPlaced = searchParams.placed === "1";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as OrderStatus);
  const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.RETURNED;

  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        {isJustPlaced && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(34,197,94,0.1)", border: "0.5px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
            <CheckCircle size={18} color="#86EFAC" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#86EFAC" }}>Order placed successfully!</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>You&apos;ll receive a confirmation soon.</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>Order</p>
            <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: TEXT }}>#{order.id.slice(-8).toUpperCase()}</h1>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <span style={{ ...s, fontSize: 11, fontWeight: 600, padding: "5px 14px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
            {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Status timeline */}
        {!["CANCELLED", "RETURNED"].includes(order.status) && (
          <div style={{ display: "flex", alignItems: "center", background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
            {STATUS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = currentStepIndex >= i;
              return (
                <div key={step} style={{ display: "flex", flex: 1, alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? GOLD : "rgba(201,151,58,0.1)", border: `0.5px solid ${done ? GOLD : "rgba(201,151,58,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={done ? DARK : MUTED} />
                    </div>
                    <span style={{ fontSize: 10, color: done ? GOLD : MUTED, letterSpacing: 0.5, whiteSpace: "nowrap" }} className="hidden sm:block">{STEP_LABELS[i]}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, margin: "0 4px 20px", background: currentStepIndex > i ? GOLD : "rgba(201,151,58,0.15)" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="sm:grid-cols-2">
          {/* Items */}
          <div style={{ gridColumn: "1 / -1", background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>Items</h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
              {order.items.map((item) => {
                const images: string[] = JSON.parse(item.product.images);
                return (
                  <li key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}>
                    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0, overflow: "hidden", borderRadius: 10, background: BUR }}>
                      {images[0] && <Image src={images[0]} alt={item.product.name} fill sizes="56px" className="object-cover" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/products/${item.product.slug}`} style={{ fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: "none" }}>{item.product.name}</Link>
                      <p style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Qty: {item.quantity} × ₹{parseFloat(item.unitPrice.toString()).toLocaleString("en-IN")}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: GOLD, flexShrink: 0 }}>₹{(parseFloat(item.unitPrice.toString()) * item.quantity).toLocaleString("en-IN")}</p>
                  </li>
                );
              })}
            </ul>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 4, borderTop: "0.5px solid rgba(201,151,58,0.15)", fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: TEXT }}>Total</span>
              <span style={{ color: GOLD }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Shipping */}
          <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>Shipping Address</h2>
            {[address.name, address.phone, `${address.line1}${address.line2 ? `, ${address.line2}` : ""}`, `${address.city}, ${address.state} — ${address.pincode}`].map((line, i) => (
              <p key={i} style={{ fontSize: 13, color: i === 0 ? TEXT : MUTED, marginBottom: 4 }}>{line}</p>
            ))}
          </div>

          {/* Payment */}
          <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>Payment</h2>
            {order.payment && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Method</span>
                  <span style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{order.payment.method === "COD" ? "Cash on Delivery" : "Online"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Status</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: order.payment.status === "PAID" ? "#86EFAC" : GOLD }}>{order.payment.status.charAt(0) + order.payment.status.slice(1).toLowerCase()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Amount</span>
                  <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>₹{parseFloat(order.payment.amount.toString()).toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Link href="/orders" style={{ display: "flex", alignItems: "center", gap: 8, border: "0.5px solid rgba(201,151,58,0.3)", color: MUTED, borderRadius: 40, padding: "11px 20px", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
            <RotateCcw size={13} /> All Orders
          </Link>
          <Link href="/products" style={{ background: GOLD, color: DARK, borderRadius: 40, padding: "11px 24px", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}
