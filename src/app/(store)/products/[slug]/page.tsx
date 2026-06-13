export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Star } from "lucide-react";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import AddToCartButton from "@/components/store/AddToCartButton";
import ReviewForm from "@/components/store/ReviewForm";
import DeleteReviewButton from "@/components/store/DeleteReviewButton";

type Props = { params: { slug: string } };

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await db.product.findFirst({
    where: { slug: params.slug, deletedAt: null, isActive: true },
    select: { name: true, description: true, images: true, price: true },
  });
  if (!product) return {};
  const images: string[] = JSON.parse(product.images);
  const price = parseFloat(product.price.toString());
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, images: images[0] ? [{ url: images[0], width: 1200, height: 1200, alt: product.name }] : [], type: "website" },
    twitter: { card: "summary_large_image", title: product.name, description },
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

  const images: string[] = JSON.parse(product.images);
  const price = parseFloat(product.price.toString());
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;
  const hasReviewed = session ? product.reviews.some((r) => r.userId === session.user.id) : false;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product",
    name: product.name, description: product.description, image: images, sku: product.id,
    brand: { "@type": "Brand", name: "Libiduo" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: price.toFixed(2), availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@type": "Organization", name: "Libiduo" } },
    ...(avgRating !== null && { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length } }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ minHeight: "100vh", background: DARK }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Product info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="md:grid-cols-2">
            <ProductImageGallery images={images} />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: GOLD }}>{product.category.name}</p>
              <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{product.name}</h1>

              {avgRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={15} style={{ fill: star <= Math.round(avgRating) ? GOLD : "transparent", color: star <= Math.round(avgRating) ? GOLD : MUTED }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: MUTED }}>{avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}

              <p style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 700, color: GOLD }}>₹{price.toLocaleString("en-IN")}</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.8 }}>{product.description}</p>

              <p style={{ fontSize: 12, fontWeight: 600, color: product.stock > 0 ? "#86EFAC" : "#E8A0A8" }}>
                {product.stock > 0 ? `In stock (${product.stock} available)` : "Sold out"}
              </p>

              <div style={{ marginTop: 8 }}>
                <AddToCartButton product={{ id: product.id, name: product.name, price, image: images[0] ?? "", stock: product.stock }} />
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ marginTop: 64 }}>
            <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Customer</p>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, color: TEXT, marginBottom: 32 }}>
              Reviews {product.reviews.length > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: MUTED }}>({product.reviews.length})</span>}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="lg:grid-cols-3">
              {/* Write review */}
              <div style={{ gridColumn: "span 1" }}>
                {!session ? (
                  <div style={{ border: "0.5px dashed rgba(201,151,58,0.3)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: MUTED }}>
                      <a href="/login" style={{ color: GOLD, textDecoration: "none" }}>Sign in</a> to leave a review
                    </p>
                  </div>
                ) : hasReviewed ? (
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#86EFAC" }}>You&apos;ve reviewed this product</p>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Thank you for your feedback!</p>
                  </div>
                ) : (
                  <ReviewForm productSlug={product.slug} />
                )}
              </div>

              {/* Reviews list */}
              <div style={{ gridColumn: "span 2" }}>
                {product.reviews.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "0.5px dashed rgba(201,151,58,0.2)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                    <Star size={32} strokeWidth={1.5} color={MUTED} />
                    <p style={{ fontSize: 14, color: MUTED, marginTop: 12 }}>No reviews yet</p>
                    <p style={{ fontSize: 12, color: "#6B5A50", marginTop: 4 }}>Be the first to review this product</p>
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                    {product.reviews.map((review) => (
                      <li key={review.id} style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.15)", borderRadius: 14, padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, background: BUR, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: GOLD, flexShrink: 0 }}>
                              {(review.user.name ?? "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{review.user.name ?? "Anonymous"}</p>
                              <p style={{ fontSize: 11, color: MUTED }}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <div style={{ display: "flex", gap: 2 }}>
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} size={13} style={{ fill: star <= review.rating ? GOLD : "transparent", color: star <= review.rating ? GOLD : MUTED }} />
                              ))}
                            </div>
                            {session?.user.id === review.userId && <DeleteReviewButton productSlug={product.slug} reviewId={review.id} />}
                          </div>
                        </div>
                        {review.comment && (
                          <p style={{ marginTop: 12, fontSize: 13, color: MUTED, lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{review.comment}&rdquo;</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
