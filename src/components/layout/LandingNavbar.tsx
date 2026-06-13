"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const GOLD = "#C9973A";
const MUTED = "#B8A99A";
const DARK = "#0D0608";
const CREAM = "#F5EDD8";
const BUR = "#6B1A2A";

export default function LandingNavbar() {
  const { count, openDrawer } = useCartStore();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,6,8,0.95)", backdropFilter: "blur(10px)",
      borderBottom: "0.5px solid rgba(201,151,58,0.3)",
    }}>
      <div style={{ padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          fontSize: 22, fontWeight: 900, color: GOLD,
          letterSpacing: 4, textDecoration: "none",
        }}>
          LIBIDUO
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }} className="hidden md:flex">
          <Link href="/products" style={{ color: MUTED, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
            Shop
          </Link>
          <a href="#about" style={{ color: MUTED, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
            About
          </a>
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" style={{ color: MUTED, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Cart */}
          <button
            onClick={openDrawer}
            aria-label="Open cart"
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}
          >
            <ShoppingCart size={20} color={MUTED} />
            {count > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: GOLD, color: DARK,
                fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
            <span style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: MUTED }} className="hidden md:inline">
              Cart {count > 0 ? `(${count})` : "(0)"}
            </span>
          </button>

          {/* User — desktop */}
          {session ? (
            <div className="relative hidden md:block group">
              <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", color: MUTED }}>
                <User size={16} color={MUTED} />
                <span style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user.name?.split(" ")[0] ?? "Account"}
                </span>
              </button>
              <div style={{
                position: "absolute", right: 0, top: "100%",
                background: "#1A0C10", border: "0.5px solid rgba(201,151,58,0.25)",
                borderRadius: 10, padding: "6px 0", minWidth: 160,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }} className="hidden group-hover:block">
                {[
                  { label: "Account", href: "/account" },
                  { label: "Orders", href: "/orders" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{ display: "block", padding: "9px 18px", fontSize: 12, color: MUTED, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}
                    className="hover:text-[#C9973A]"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 18px", fontSize: 12, color: "#B05060", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", padding: "6px 8px" }} className="hidden md:block">
              Sign in
            </Link>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: MUTED }}
            className="md:hidden"
          >
            {menuOpen ? <X size={20} color={MUTED} /> : <Menu size={20} color={MUTED} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "rgba(13,6,8,0.98)", borderTop: "0.5px solid rgba(201,151,58,0.15)", padding: "16px 20px 20px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Shop", href: "/products" },
              { label: "About", href: "#about" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}
                style={{ fontSize: 13, color: MUTED, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "10px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}
              >
                {label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: MUTED, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "10px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}>Account</Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: MUTED, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "10px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}>Orders</Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: MUTED, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "10px 0", borderBottom: "0.5px solid rgba(201,151,58,0.08)" }}>Admin</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} style={{ textAlign: "left", fontSize: 13, color: "#B05060", letterSpacing: 2, textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: "10px 0" }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 13, color: GOLD, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "10px 0" }}>
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
