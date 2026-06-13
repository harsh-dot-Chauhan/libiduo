export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ReviewForm from "@/components/store/ReviewForm";
import DeleteReviewButton from "@/components/store/DeleteReviewButton";
import PDPGallery from "@/components/store/PDPGallery";
import PDPCartSection from "@/components/store/PDPCartSection";
import PDPPincode from "@/components/store/PDPPincode";
import PDPAccordion from "@/components/store/PDPAccordion";

type Props = { params: { slug: string } };

const GOLD = "#C9973A";
const GREEN = "#7CBA5A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const MID2 = "#251018";
const BUR = "#6B1A2A";
const BUR_DARK = "#3C0A14";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const CREAM = "#F5EDD8";
const BORDER = "rgba(201,151,58,0.2)";

const MARQUEE = [
  "Free Shipping above ₹999","✦","Discreet Packaging","✦",
  "100% Body Safe","✦","Easy Returns","✦","COD Available","✦",
  "Free Shipping above ₹999","✦","Discreet Packaging","✦",
  "100% Body Safe","✦","Easy Returns","✦","COD Available","✦",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await db.product.findFirst({
    where: { slug: params.slug, deletedAt: null, isActive: true },
    select: { name: true, description: true, images: true, price: true },
  });
  if (!product) return {};
  const images: string[] = JSON.parse(product.images);
  const price = parseFloat(product.price.toString());
  const desc = product.description.slice(0, 155);
  return {
    title: `${product.name} — LIBIDUO`,
    description: desc,
    openGraph: { title: product.name, description: desc, images: images[0] ? [{ url: images[0], width: 1200, height: 1200, alt: product.name }] : [], type: "website" },
    twitter: { card: "summary_large_image", title: product.name, description: desc },
    other: { "product:price:amount": String(price), "product:price:currency": "INR" },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const [product, session] = await Promise.all([
    db.product.findFirst({
      where: { slug: params.slug, deletedAt: null, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true, userId: true, user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    auth(),
  ]);
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, slug: { not: product.slug }, deletedAt: null, isActive: true },
    take: 4,
    select: { name: true, slug: true, price: true, mrp: true, images: true },
  });

  const images: string[] = JSON.parse(product.images);
  const price = parseFloat(product.price.toString());
  const mrp = product.mrp ? parseFloat(product.mrp.toString()) : null;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = product.reviews.filter(r => r.rating === star).length;
    const pct = product.reviews.length > 0 ? Math.round((count / product.reviews.length) * 100) : 0;
    return { star, pct };
  });

  const hasReviewed = session ? product.reviews.some(r => r.userId === session.user.id) : false;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product",
    name: product.name, description: product.description, image: images, sku: product.id,
    brand: { "@type": "Brand", name: "LIBIDUO" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: price.toFixed(2), availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@type": "Organization", name: "LIBIDUO" } },
    ...(avgRating !== null && { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length } }),
  };

  const accordionItems = [
    {
      title: "Product Description",
      content: <p>{product.description}</p>,
    },
    {
      title: "Shipping & Returns",
      content: (
        <>
          <p>All orders are shipped in plain, unmarked packaging. The sender name reads &ldquo;LBD Commerce Pvt Ltd&rdquo; — no product references.</p>
          <br />
          <p>Delivery within 2–5 business days pan-India. Express delivery (1–2 days) available at checkout. Returns accepted within 7 days for unopened, sealed products.</p>
        </>
      ),
    },
    {
      title: "Why LIBIDUO?",
      content: (
        <ul style={{ paddingLeft: 16 }}>
          {["100% body-safe, dermatologist-tested materials", "Plain discreet packaging — no brand names on box", "Pan-India delivery within 48 hours", "7-day easy returns on unopened products", "COD available across India"].map(pt => (
            <li key={pt} style={{ marginBottom: 6 }}>{pt}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: DARK, color: TEXT, minHeight: "100vh", paddingBottom: 100, fontFamily: "'Inter', var(--font-geist-sans), sans-serif", overflowX: "hidden" }}>

        {/* Marquee */}
        <div style={{ background: BUR, padding: "9px 0", overflow: "hidden", whiteSpace: "nowrap", borderBottom: `0.5px solid ${BORDER}` }}>
          <div className="animate-marquee" style={{ display: "inline-block" }}>
            {MARQUEE.map((item, i) => (
              <span key={i} style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: item === "✦" ? GOLD : CREAM, margin: item === "✦" ? "0" : "0 24px" }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: `0.5px solid ${BORDER}`, flexWrap: "wrap" }}>
          {[
            { label: "Home", href: "/" },
            { label: "Shop All", href: "/products" },
            { label: product.category.name, href: `/products?category=${product.category.slug}` },
          ].map(({ label, href }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link href={href} style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>{label}</Link>
              <span style={{ fontSize: 10, color: "rgba(184,169,154,0.4)" }}>›</span>
            </span>
          ))}
          <span style={{ fontSize: 11, color: GOLD }}>{product.name}</span>
        </div>

        {/* Gallery */}
        <PDPGallery images={images} productName={product.name} badge={product.badge} />

        {/* Product Info */}
        <div style={{ padding: "20px 16px" }}>

          {/* Brand + Stock */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: GOLD }}>LIBIDUO</span>
            <span style={{ fontSize: 11, color: product.stock > 0 ? GREEN : "#E8A0A8", display: "flex", alignItems: "center", gap: 4 }}>
              {product.stock > 0 ? "✓ In Stock" : "✕ Out of Stock"}
            </span>
          </div>

          {/* Name */}
          <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 12 }}>
            {product.name}
          </h1>

          {/* Rating row */}
          {avgRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: `0.5px solid ${BORDER}` }}>
              <span style={{ color: GOLD, fontSize: 14 }}>
                {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{avgRating.toFixed(1)}</span>
              <span style={{ color: BORDER }}>·</span>
              <span style={{ fontSize: 12, color: MUTED }}>{product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Price block */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 700, color: GOLD }}>
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp && mrp > price && (
                <>
                  <span style={{ fontSize: 15, color: MUTED, textDecoration: "line-through" }}>₹{mrp.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize: 13, color: GREEN, fontWeight: 500 }}>{discount}% off</span>
                </>
              )}
            </div>
            <div style={{ fontSize: 11, color: MUTED }}>Inclusive of all taxes &nbsp;·&nbsp; Free shipping on this order</div>
          </div>

          {/* Qty + Add to Cart (client) */}
          <PDPCartSection product={{ id: product.id, name: product.name, price, image: images[0] ?? "", stock: product.stock }} />

          {/* Delivery + Pincode (client) */}
          <PDPPincode />

          {/* Accordion (client) */}
          <PDPAccordion items={accordionItems} />
        </div>

        {/* Reviews */}
        <div style={{ padding: "0 16px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, color: TEXT, marginBottom: 16 }}>
            Customer Reviews
          </h2>

          {/* Rating summary */}
          {product.reviews.length > 0 && (
            <div style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16, paddingBottom: 16, borderBottom: `0.5px solid ${BORDER}` }}>
                <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 48, color: GOLD, fontWeight: 700, lineHeight: 1 }}>
                  {avgRating!.toFixed(1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: GOLD, fontSize: 18, marginBottom: 4 }}>
                    {"★".repeat(Math.round(avgRating!))}{"☆".repeat(5 - Math.round(avgRating!))}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED }}>Based on {product.reviews.length} reviews</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ratingDist.map(({ star, pct }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: MUTED, width: 14, textAlign: "right" }}>{star}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(201,151,58,0.15)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: MUTED, width: 28 }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write review */}
          <div style={{ marginBottom: 16 }}>
            {!session ? (
              <div style={{ border: "0.5px dashed rgba(201,151,58,0.3)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: MUTED }}>
                  <Link href="/login" style={{ color: GOLD, textDecoration: "none" }}>Sign in</Link> to leave a review
                </p>
              </div>
            ) : hasReviewed ? (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#86EFAC" }}>You&apos;ve reviewed this product</p>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Thank you for your feedback!</p>
              </div>
            ) : (
              <ReviewForm productSlug={product.slug} />
            )}
          </div>

          {/* Review cards */}
          {product.reviews.length === 0 ? (
            <div style={{ border: "0.5px dashed rgba(201,151,58,0.2)", borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>★</div>
              <p style={{ fontSize: 14, color: MUTED }}>No reviews yet</p>
              <p style={{ fontSize: 12, color: "#6B5A50", marginTop: 4 }}>Be the first to review this product</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {product.reviews.map(review => (
                <div key={review.id} style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, background: BUR, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: CREAM, flexShrink: 0 }}>
                      {(review.user.name ?? "A")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{review.user.name ?? "Anonymous"}</span>
                        {session?.user.id === review.userId && <DeleteReviewButton productSlug={product.slug} reviewId={review.id} />}
                      </div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        ✓ Verified Purchase · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: GOLD, fontSize: 12, marginBottom: 8 }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div style={{ paddingLeft: 16, marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, color: TEXT, marginBottom: 16, paddingRight: 16 }}>
              You May Also Like
            </h2>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingRight: 16, scrollbarWidth: "none" }}>
              {related.map(rel => {
                const relImages: string[] = JSON.parse(rel.images);
                const relPrice = parseFloat(rel.price.toString());
                const relMrp = rel.mrp ? parseFloat(rel.mrp.toString()) : null;
                return (
                  <Link key={rel.slug} href={`/products/${rel.slug}`} style={{ textDecoration: "none", flexShrink: 0, width: 150 }}>
                    <div style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${BUR_DARK}, ${MID2})`, position: "relative" }}>
                        {relImages[0] ? (
                          <Image src={relImages[0]} alt={rel.name} fill sizes="150px" style={{ objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 40 }}>🌹</span>
                        )}
                      </div>
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, marginBottom: 4, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {rel.name}
                        </div>
                        <div>
                          <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>₹{relPrice.toLocaleString("en-IN")}</span>
                          {relMrp && relMrp > relPrice && (
                            <span style={{ fontSize: 10, color: MUTED, textDecoration: "line-through", marginLeft: 4 }}>₹{relMrp.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
