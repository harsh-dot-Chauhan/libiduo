export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "rgba(201,151,58,0.15)",  color: GOLD },
  CONFIRMED: { bg: "rgba(59,130,246,0.15)",  color: "#93C5FD" },
  SHIPPED:   { bg: "rgba(139,92,246,0.15)",  color: "#C4B5FD" },
  DELIVERED: { bg: "rgba(34,197,94,0.15)",   color: "#86EFAC" },
  CANCELLED: { bg: "rgba(107,26,42,0.3)",    color: "#E8A0A8" },
  RETURNED:  { bg: "rgba(184,169,154,0.1)",  color: MUTED },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { method: true, status: true } },
      items: { take: 1, include: { product: { select: { name: true, images: true } } } },
    },
  });

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <Package size={56} strokeWidth={1.5} color={MUTED} />
        <h1 style={{ marginTop: 16, fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: "var(--font-playfair), serif" }}>No orders yet</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: MUTED }}>Your order history will appear here.</p>
        <Link href="/products" style={{ marginTop: 24, background: GOLD, color: DARK, borderRadius: 40, padding: "13px 32px", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Your</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: TEXT, marginBottom: 32 }}>Orders</h1>

        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => {
            const firstItem = order.items[0];
            const images: string[] = firstItem ? JSON.parse(firstItem.product.images) : [];
            const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.RETURNED;
            return (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} style={{ display: "flex", alignItems: "center", gap: 16, background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 16, padding: 16, textDecoration: "none" }}>
                  <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0, overflow: "hidden", borderRadius: 10, background: BUR }}>
                    {images[0] && <Image src={images[0]} alt={firstItem?.product.name ?? ""} fill sizes="64px" className="object-cover" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: MUTED, letterSpacing: 1 }}>Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {firstItem?.product.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: GOLD, marginTop: 4 }}>₹{parseFloat(order.total.toString()).toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                    <p style={{ fontSize: 11, color: MUTED }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
