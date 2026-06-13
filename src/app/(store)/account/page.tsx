export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const GOLD = "#C9973A";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const DARK = "#0D0608";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/account");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: DARK }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>My</p>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: TEXT, marginBottom: 32 }}>Account</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Profile card */}
          <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 56, height: 56, background: "#6B1A2A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-playfair), serif", fontSize: 22, fontWeight: 700, color: GOLD, flexShrink: 0 }}>
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{user.name ?? "—"}</p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{user.email}</p>
              <p style={{ fontSize: 11, color: "#6B5A50", marginTop: 4, letterSpacing: 0.5 }}>
                Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <Link href="/orders" style={{ display: "flex", alignItems: "center", gap: 16, background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 20, textDecoration: "none", transition: "border-color 0.2s" }}>
            <div style={{ width: 44, height: 44, background: "#6B1A2A", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Package size={18} color={GOLD} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>My Orders</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>View and track your orders</p>
            </div>
          </Link>

          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, background: MID, border: "0.5px solid rgba(107,26,42,0.3)", borderRadius: 16, padding: 20, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, background: "rgba(107,26,42,0.4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🚪</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#E8A0A8" }}>Sign out</p>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Sign out of your account</p>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
