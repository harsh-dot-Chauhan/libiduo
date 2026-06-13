import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "LIBIDUO — Pleasure. Reimagined.",
  description:
    "Premium intimacy products designed for the bold, the curious, and the deeply connected. Discreet shipping pan-India.",
};

const B = "#6B1A2A";
const BL = "#8B2A3E";
const GOLD = "#C9973A";
const CREAM = "#F5EDD8";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";

const STATS = [
  { num: "50K+", lbl: "Happy Couples" },
  { num: "100%", lbl: "Body Safe" },
  { num: "4.9★", lbl: "Avg Rating" },
  { num: "48hr", lbl: "Discreet Ship" },
];

const FEATURES = [
  { icon: "🔒", title: "100% Discreet", desc: "Plain packaging. No brand names. No awkward questions. Your privacy is sacred to us." },
  { icon: "✨", title: "Premium Materials", desc: "Only body-safe, dermatologist-tested ingredients and materials. Because you deserve the best." },
  { icon: "💑", title: "Couples First", desc: "Every product is designed to bring partners closer — for solo adventurers and duos alike." },
  { icon: "🚀", title: "Fast Delivery", desc: "Pan-India delivery within 48 hours. Because some things just can't wait." },
];

const TESTIMONIALS = [
  { initial: "P", text: "LIBIDUO completely transformed our evenings. The Velvet Rose Set is absolutely incredible — worth every rupee and then some.", name: "Priya S.", loc: "Mumbai • Verified Buyer" },
  { initial: "R", text: "Finally a brand that gets it. Discreet, premium, and the quality is unmatched. My partner and I are hooked!", name: "Rahul K.", loc: "Delhi • Verified Buyer" },
  { initial: "A", text: "The packaging alone made me feel special. But the products? Next level. LIBIDUO is the only brand I trust for this.", name: "Ananya M.", loc: "Bangalore • Verified Buyer" },
];

const MARQUEE_ITEMS = [
  "Premium Quality", "✦", "Discreet Shipping", "✦",
  "Body Safe Materials", "✦", "Couples Friendly", "✦", "Free Returns", "✦",
  "Premium Quality", "✦", "Discreet Shipping", "✦",
  "Body Safe Materials", "✦", "Couples Friendly", "✦", "Free Returns", "✦",
];

const FOOTER_LINKS = [
  { label: "Shop All", href: "/products" },
  { label: "About Us", href: "#about" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
];

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true, name: true, slug: true, price: true,
      images: true, stock: true, description: true,
    },
  });
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div style={{ background: DARK, color: TEXT, fontFamily: "var(--font-geist-sans), Inter, sans-serif", overflowX: "hidden" }}>

      {/* ── Hero ── */}
      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "60px 24px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%, rgba(107,26,42,0.5) 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(201,151,58,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: GOLD, border: `0.5px solid rgba(201,151,58,0.5)`, padding: "6px 16px", borderRadius: 20, display: "inline-block", marginBottom: 24 }}>
            New Collection 2026
          </span>
          <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "clamp(44px, 8vw, 64px)", fontWeight: 900, lineHeight: 1.05, color: TEXT, marginBottom: 16 }}>
            Pleasure.<br /><span style={{ color: GOLD }}>Reimagined.</span>
          </h1>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 36px" }}>
            Premium intimacy products designed for the bold, the curious, and the deeply connected.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href="/products" style={{ background: GOLD, color: DARK, padding: "14px 36px", borderRadius: 40, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s" }}>
              Shop Now
            </Link>
            <a href="#about" style={{ background: "transparent", color: GOLD, padding: "14px 36px", border: `0.5px solid ${GOLD}`, borderRadius: 40, fontSize: 13, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
              Our Story
            </a>
          </div>
          <p style={{ marginTop: 48, color: MUTED, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>↓ &nbsp; Explore Collection</p>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ background: B, padding: "10px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div className="animate-marquee" style={{ display: "inline-block" }}>
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: item === "✦" ? GOLD : CREAM, margin: item === "✦" ? "0" : "0 32px" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── About / Story ── */}
      <section id="about" style={{ padding: "60px 24px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Our Story</p>
        <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 16 }}>
          Born from desire.<br />Built for connection.
        </h2>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8 }}>
          LIBIDUO is more than a brand — it&apos;s a movement. We believe intimacy should be celebrated, explored, and elevated. Every product is crafted with intention, care, and a whole lot of passion.
        </p>

        <div style={{ background: MID, border: `0.5px solid rgba(201,151,58,0.2)`, borderRadius: 16, padding: 28, marginTop: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {STATS.map(({ num, lbl }) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, color: GOLD, fontWeight: 700 }}>{num}</div>
                <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section style={{ padding: "0 24px 60px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Featured Products</p>
        <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 28 }}>
          Our bestsellers.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {products.length > 0 ? products.map((product) => {
            const images: string[] = JSON.parse(product.images);
            const price = parseFloat(product.price.toString());
            return (
              <div key={product.id} style={{ background: MID, border: `0.5px solid rgba(201,151,58,0.15)`, borderRadius: 16, overflow: "hidden" }}>
                <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ height: 200, background: `linear-gradient(135deg, ${B} 0%, ${MID} 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {images[0] ? (
                      <Image src={images[0]} alt={product.name} fill sizes="640px" className="object-cover" style={{ opacity: 0.85 }} />
                    ) : (
                      <span style={{ fontSize: 56 }}>🌹</span>
                    )}
                    <span style={{ position: "absolute", top: 12, right: 12, background: GOLD, color: DARK, fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>
                      {product.stock > 0 ? "In Stock" : "Sold Out"}
                    </span>
                  </div>
                </Link>
                <div style={{ padding: 20 }}>
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: TEXT, marginBottom: 6 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>{product.description.slice(0, 100)}…</div>
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 20, color: GOLD, fontWeight: 600 }}>₹{price.toLocaleString("en-IN")}</span>
                    <Link href={`/products/${product.slug}`} style={{ background: B, color: CREAM, borderRadius: 20, padding: "8px 20px", fontSize: 12, fontWeight: 500, letterSpacing: 1, textDecoration: "none" }}>
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            /* Placeholder cards when DB is empty */
            [
              { emoji: "🌹", badge: "Bestseller", name: "Velvet Rose Set", desc: "A luxurious couples kit designed to deepen connection and ignite passion.", price: "₹2,499" },
              { emoji: "🕯️", badge: "New", name: "Midnight Ritual", desc: "Sensual aromatherapy candle collection with aphrodisiac scents.", price: "₹1,299" },
              { emoji: "💎", badge: "Limited", name: "Diamond Touch", desc: "Our signature premium intimacy collection for those who demand the finest.", price: "₹4,999" },
            ].map((p) => (
              <div key={p.name} style={{ background: MID, border: `0.5px solid rgba(201,151,58,0.15)`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${B} 0%, ${MID} 100%)`, position: "relative" }}>
                  <span style={{ fontSize: 56 }}>{p.emoji}</span>
                  <span style={{ position: "absolute", top: 12, right: 12, background: GOLD, color: DARK, fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>{p.badge}</span>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: TEXT, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 20, color: GOLD, fontWeight: 600 }}>{p.price}</span>
                    <Link href="/products" style={{ background: B, color: CREAM, borderRadius: 20, padding: "8px 20px", fontSize: 12, fontWeight: 500, letterSpacing: 1, textDecoration: "none" }}>Shop Now</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/products" style={{ background: "transparent", color: GOLD, border: `0.5px solid ${GOLD}`, borderRadius: 40, padding: "12px 32px", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", fontWeight: 500 }}>
            View All Products
          </Link>
        </div>
      </section>

      {/* ── Why LIBIDUO ── */}
      <section style={{ background: MID, padding: "60px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Why LIBIDUO</p>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 28 }}>
            We do it differently.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 20, background: "rgba(107,26,42,0.15)", border: "0.5px solid rgba(107,26,42,0.3)", borderRadius: 12 }}>
                <div style={{ width: 44, height: 44, background: B, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "60px 24px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Reviews</p>
        <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 28 }}>
          They&apos;re obsessed.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {TESTIMONIALS.map(({ initial, text, name, loc }) => (
            <div key={name} style={{ background: MID, border: `0.5px solid rgba(201,151,58,0.15)`, borderRadius: 16, padding: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>&ldquo;{text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, background: B, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: CREAM, flexShrink: 0 }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section style={{ background: B, padding: "60px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px, 5vw, 32px)", color: CREAM, marginBottom: 12 }}>
            Join the LIBIDUO club.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(240,230,211,0.7)", marginBottom: 28, lineHeight: 1.7 }}>
            Get exclusive offers, new arrivals, and spicy tips delivered straight to your inbox. 18+ only.
          </p>
          <form style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{ background: "rgba(13,6,8,0.4)", border: `0.5px solid rgba(201,151,58,0.4)`, color: TEXT, padding: "14px 20px", borderRadius: 40, fontSize: 14, outline: "none", textAlign: "center", width: "100%" }}
            />
            <button type="submit" style={{ background: GOLD, color: DARK, padding: "14px 36px", border: "none", borderRadius: 40, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", width: "100%" }}>
              Subscribe — It&apos;s Free
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: DARK, padding: "40px 24px 24px", borderTop: `0.5px solid rgba(201,151,58,0.2)` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 24, color: GOLD, letterSpacing: 4, marginBottom: 8 }}>LIBIDUO</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 28 }}>Pleasure. Reimagined.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
            {FOOTER_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: MUTED, textDecoration: "none", padding: "4px 0" }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            {["IG", "TW", "WA"].map((s) => (
              <div key={s} style={{ width: 36, height: 36, border: `0.5px solid rgba(201,151,58,0.3)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                {s}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "rgba(184,169,154,0.5)", textAlign: "center", borderTop: `0.5px solid rgba(201,151,58,0.1)`, paddingTop: 20, letterSpacing: 1 }}>
            © 2026 LIBIDUO. All rights reserved. &nbsp;|&nbsp; For adults 18+ only.
          </div>
        </div>
      </footer>
    </div>
  );
}
