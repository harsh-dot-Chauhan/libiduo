"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import {
  Search, X, SlidersHorizontal, ArrowUpDown, ShoppingBag,
  Lock, Star, ChevronRight, Flame, Sparkles, ArrowUpNarrowWide,
  ArrowDownNarrowWide, TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlpProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  mrp: string | null;
  badge: string | null;
  stock: number;
  images: string;
  tags: string | null;
  description: string;
  category: { name: string; slug: string };
  avgRating: number | null;
  reviewCount: number;
};

type Category = { id: string; name: string; slug: string };

type Props = {
  initialProducts: PlpProduct[];
  categories: Category[];
  initialTotal: number;
  initialTotalPages: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bur: "#6B1A2A", burLight: "#8B2A3E", burDark: "#3C0A14",
  gold: "#C9973A", goldLight: "#E8B84B",
  cream: "#F5EDD8", dark: "#0D0608", mid: "#1A0C10", mid2: "#251018",
  text: "#F0E6D3", muted: "#B8A99A", border: "rgba(201,151,58,0.2)",
  green: "#7CBA5A",
};

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  New:        { bg: C.gold,    color: C.dark },
  Bestseller: { bg: C.bur,     color: C.cream },
  Sale:       { bg: "#1A3A1A", color: C.green },
  Limited:    { bg: C.burDark, color: C.gold },
};

const SORT_OPTIONS = [
  { value: "popular",    label: "Most Popular",      Icon: TrendingUp },
  { value: "newest",     label: "Newest First",      Icon: Sparkles },
  { value: "price_asc",  label: "Price: Low to High", Icon: ArrowUpNarrowWide },
  { value: "price_desc", label: "Price: High to Low", Icon: ArrowDownNarrowWide },
  { value: "rating",     label: "Top Rated",          Icon: Star },
];

const LIMIT = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function starsStr(r: number) {
  const f = Math.floor(r);
  return "★".repeat(f) + "☆".repeat(5 - f);
}

function discPct(price: string, mrp: string) {
  const p = parseFloat(price), m = parseFloat(mrp);
  return Math.round(((m - p) / m) * 100);
}

function fmtPrice(val: string | number) {
  return parseFloat(String(val)).toLocaleString("en-IN");
}

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCardItem({
  product,
  onQuickView,
  onAddToCart,
}: {
  product: PlpProduct;
  onQuickView: (p: PlpProduct) => void;
  onAddToCart: (p: PlpProduct) => void;
}) {
  const images = parseImages(product.images);
  const hasImage = images.length > 0;
  const hasMrp = !!product.mrp && parseFloat(product.mrp) > parseFloat(product.price);
  const badge = product.badge ? BADGE_STYLES[product.badge] : null;

  return (
    <div
      style={{
        background: C.mid, border: `0.5px solid ${C.border}`,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transition: "all 0.25s", position: "relative",
      }}
      className="product-plp-card"
      onClick={() => onQuickView(product)}
    >
      {/* Image area */}
      <div style={{
        height: 160, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        background: `linear-gradient(135deg, ${C.burDark} 0%, ${C.mid2} 100%)`,
      }}>
        {hasImage ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
            style={{ opacity: 0.9 }}
          />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.4 }}>🌹</span>
        )}

        {/* Badge */}
        {badge && product.badge && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            fontSize: 9, fontWeight: 600, padding: "3px 8px",
            borderRadius: 20, letterSpacing: 1, textTransform: "uppercase",
            background: badge.bg, color: badge.color,
          }}>
            {product.badge}
          </span>
        )}

        {/* Discreet shipping badge */}
        <div style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          background: "rgba(13,6,8,0.75)", borderRadius: 6,
          padding: "4px 8px", display: "flex", alignItems: "center", gap: 4,
        }}>
          <Lock size={10} color={C.gold} />
          <span style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>Discreet shipping</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>
          {product.name}
        </div>

        {/* Rating */}
        {product.avgRating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <span style={{ color: C.gold, fontSize: 10 }}>{starsStr(product.avgRating)}</span>
            <span style={{ fontSize: 10, color: C.muted }}>({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.gold }}>₹{fmtPrice(product.price)}</span>
          {hasMrp && (
            <>
              <span style={{ fontSize: 11, color: C.muted, textDecoration: "line-through" }}>₹{fmtPrice(product.mrp!)}</span>
              <span style={{ fontSize: 10, color: C.green, fontWeight: 500 }}>{discPct(product.price, product.mrp!)}% off</span>
            </>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          disabled={product.stock === 0}
          style={{
            width: "100%", background: product.stock === 0 ? C.mid2 : C.bur,
            color: product.stock === 0 ? C.muted : C.cream,
            border: "none", padding: "8px", borderRadius: 20,
            fontSize: 11, fontWeight: 500, cursor: product.stock === 0 ? "not-allowed" : "pointer",
            letterSpacing: 1, transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <ShoppingBag size={13} />
          {product.stock === 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function QuickViewSheet({
  product,
  onClose,
  onAddToCart,
}: {
  product: PlpProduct | null;
  onClose: () => void;
  onAddToCart: (p: PlpProduct) => void;
}) {
  const open = !!product;
  const images = product ? parseImages(product.images) : [];
  const hasImage = images.length > 0;
  const hasMrp = !!product?.mrp && parseFloat(product.mrp) > parseFloat(product.price);
  const badge = product?.badge ? BADGE_STYLES[product.badge] : null;
  const tags = product ? parseTags(product.tags) : [];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!product) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,6,8,0.85)",
          zIndex: 300, display: open ? "block" : "none",
        }}
      />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.mid, borderRadius: "24px 24px 0 0",
        zIndex: 301, maxHeight: "90vh", overflowY: "auto",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s ease",
        padding: "0 0 32px",
      }}
        className="qv-sheet-max"
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "rgba(201,151,58,0.3)", borderRadius: 2, margin: "12px auto 0" }} />

        {/* Close btn */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(13,6,8,0.6)", border: `0.5px solid ${C.border}`,
            width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: C.muted,
          }}
        >
          <X size={16} />
        </button>

        {/* Image */}
        <div style={{
          height: 240, margin: "16px 16px 20px",
          background: `linear-gradient(135deg, ${C.burDark} 0%, ${C.mid2} 100%)`,
          borderRadius: 16, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {hasImage ? (
            <Image src={images[0]} alt={product.name} fill className="object-cover" style={{ opacity: 0.9 }} sizes="100vw" />
          ) : (
            <span style={{ fontSize: 80, opacity: 0.4 }}>🌹</span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "0 20px" }}>
          {badge && product.badge && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "3px 10px",
                borderRadius: 20, letterSpacing: 1, textTransform: "uppercase",
                background: badge.bg, color: badge.color,
              }}>
                {product.badge}
              </span>
            </div>
          )}

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>
            {product.name}
          </h2>

          {product.avgRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: C.gold, fontSize: 14 }}>{starsStr(product.avgRating)}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{product.reviewCount} verified reviews</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 26, fontWeight: 600, color: C.gold }}>₹{fmtPrice(product.price)}</span>
            {hasMrp && (
              <>
                <span style={{ fontSize: 14, color: C.muted, textDecoration: "line-through" }}>₹{fmtPrice(product.mrp!)}</span>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{discPct(product.price, product.mrp!)}% off</span>
              </>
            )}
          </div>

          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {tags.map((t) => (
                <span key={t} style={{
                  padding: "5px 12px",
                  background: "rgba(107,26,42,0.2)", border: "0.5px solid rgba(107,26,42,0.5)",
                  borderRadius: 20, fontSize: 11, color: C.muted,
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              disabled={product.stock === 0}
              style={{
                flex: 1, background: product.stock === 0 ? C.mid2 : C.gold,
                color: product.stock === 0 ? C.muted : C.dark,
                border: "none", padding: 14, borderRadius: 40,
                fontSize: 13, fontWeight: 600, letterSpacing: 1, cursor: product.stock === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <ShoppingBag size={16} />
              {product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </button>
            <Link
              href={`/products/${product.slug}`}
              style={{
                background: "transparent", border: `0.5px solid ${C.border}`,
                color: C.muted, padding: "14px 18px", borderRadius: 40,
                fontSize: 12, letterSpacing: 1, textDecoration: "none",
                display: "flex", alignItems: "center",
              }}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterDrawer({
  open,
  onClose,
  onApply,
  sortBy,
  priceMin,
  priceMax,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (sort: string, min: string, max: string) => void;
  sortBy: string;
  priceMin: string;
  priceMax: string;
}) {
  const [localSort, setLocalSort] = useState(sortBy);
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);

  useEffect(() => {
    setLocalSort(sortBy); setLocalMin(priceMin); setLocalMax(priceMax);
  }, [sortBy, priceMin, priceMax, open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          display: open ? "block" : "none",
          position: "fixed", inset: 0, background: "rgba(13,6,8,0.8)", zIndex: 200,
        }}
      />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.mid, borderRadius: "20px 20px 0 0",
        zIndex: 201, maxHeight: "85vh", overflowY: "auto",
        padding: "0 0 32px",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
      }}
        className="qv-sheet-max"
      >
        <div style={{ width: 40, height: 4, background: "rgba(201,151,58,0.3)", borderRadius: 2, margin: "12px auto 20px" }} />
        <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `0.5px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.text }}>Filter & Sort</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Sort */}
        <div style={{ padding: 20, borderBottom: `0.5px solid ${C.border}` }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>Sort by</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SORT_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setLocalSort(value)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                  border: `0.5px solid ${localSort === value ? C.gold : C.border}`,
                  background: localSort === value ? "rgba(201,151,58,0.08)" : "transparent",
                  color: localSort === value ? C.gold : C.text, fontSize: 13, fontFamily: "inherit",
                }}
              >
                <Icon size={16} color={localSort === value ? C.gold : C.muted} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>Price Range (₹)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Min ₹", val: localMin, set: setLocalMin },
              { label: "Max ₹", val: localMax, set: setLocalMax },
            ].map(({ label, val, set }) => (
              <input
                key={label}
                type="number"
                placeholder={label}
                value={val}
                onChange={(e) => set(e.target.value)}
                style={{
                  background: C.mid2, border: `0.5px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 12px",
                  color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", gap: 10 }}>
          <button
            onClick={() => { setLocalMin(""); setLocalMax(""); setLocalSort("popular"); }}
            style={{
              background: "transparent", color: C.muted,
              border: `0.5px solid rgba(184,169,154,0.3)`,
              padding: "14px 20px", borderRadius: 40, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => { onApply(localSort, localMin, localMax); onClose(); }}
            style={{
              flex: 1, background: C.gold, color: C.dark, border: "none",
              padding: 14, borderRadius: 40, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: C.mid, border: `0.5px solid ${C.gold}`,
      borderRadius: 40, padding: "10px 20px", fontSize: 12, color: C.gold,
      letterSpacing: 1, opacity: visible ? 1 : 0,
      transition: "all 0.3s", zIndex: 500, whiteSpace: "nowrap", pointerEvents: "none",
    }}>
      {msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlpInteractive({ initialProducts, categories, initialTotal, initialTotalPages }: Props) {
  const { addItem } = useCartStore();

  // Filter state
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Products state
  const [products, setProducts] = useState<PlpProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // UI state
  const [quickView, setQuickView] = useState<PlpProduct | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  // Ref so the search debounce always calls the latest buildParams, not the one
  // captured at the time setTimeout was scheduled (stale-closure fix).
  const buildParamsRef = useRef<(overrides?: Record<string, string | number>, pg?: number) => string>(() => "");
  // Ref guard prevents two rapid "Load More" taps from issuing duplicate page requests.
  const loadingMoreRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const buildParams = useCallback((overrides: Record<string, string | number> = {}, pg = 1) => {
    const p = new URLSearchParams();
    const cat = overrides.category !== undefined ? String(overrides.category) : selectedCat;
    const q = overrides.search !== undefined ? String(overrides.search) : searchInput;
    const s = overrides.sort !== undefined ? String(overrides.sort) : sortBy;
    const mn = overrides.minPrice !== undefined ? String(overrides.minPrice) : priceMin;
    const mx = overrides.maxPrice !== undefined ? String(overrides.maxPrice) : priceMax;

    if (cat && cat !== "all") p.set("category", cat);
    if (q) p.set("search", q);
    // Always send sort so the API never falls back to its "newest" schema default
    // when the client intends "popular" ordering.
    if (s) p.set("sort", s);
    if (mn) p.set("minPrice", mn);
    if (mx) p.set("maxPrice", mx);
    p.set("page", String(pg));
    p.set("limit", String(LIMIT));
    return p.toString();
  }, [selectedCat, searchInput, sortBy, priceMin, priceMax]);

  // Keep the ref in sync so debounce callbacks always read the latest buildParams.
  useEffect(() => { buildParamsRef.current = buildParams; }, [buildParams]);

  const fetchProducts = useCallback(async (paramStr: string, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/products?${paramStr}`);
      const json = await res.json();
      if (!json.success) return;
      const { products: newProducts, total: newTotal, totalPages } = json.data;

      setProducts((prev) => append ? [...prev, ...newProducts] : newProducts);
      setTotal(newTotal);
      const newPage = json.data.page;
      setPage(newPage);
      setHasMore(newPage < totalPages);
    } finally {
      if (!append) setIsLoading(false);
      else { setIsLoadingMore(false); loadingMoreRef.current = false; }
    }
  }, []);

  const handleCatClick = (slug: string) => {
    setSelectedCat(slug);
    const params = buildParams({ category: slug });
    fetchProducts(params, false);
  };

  const handleSearch = (val: string) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      // Use ref so this fires with the latest filter state, not the closure
      // captured when setTimeout was originally scheduled.
      const params = buildParamsRef.current({ search: val });
      fetchProducts(params, false);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const params = buildParams({ search: "" });
    fetchProducts(params, false);
  };

  const handleApplyFilters = (sort: string, min: string, max: string) => {
    setSortBy(sort);
    setPriceMin(min);
    setPriceMax(max);
    const params = buildParams({ sort, minPrice: min, maxPrice: max });
    fetchProducts(params, false);
    showToast("Filters applied");
  };

  const handleLoadMore = () => {
    // Synchronous ref guard prevents duplicate requests on rapid double-tap
    // before the async setIsLoadingMore(true) causes a re-render.
    if (loadingMoreRef.current || isLoadingMore) return;
    loadingMoreRef.current = true;
    const params = buildParams({}, page + 1);
    fetchProducts(params, true);
  };

  const handleAddToCart = useCallback(async (product: PlpProduct) => {
    try {
      await addItem(product.id, 1);
      showToast("Added to cart");
    } catch {
      showToast("Failed to add to cart");
    }
  }, [addItem, showToast]);

  const activeFilters = [
    priceMin && `Min ₹${priceMin}`,
    priceMax && `Max ₹${priceMax}`,
  ].filter(Boolean) as string[];

  return (
    <div style={{ background: C.dark, minHeight: "100vh", color: C.text, fontFamily: "'Inter', sans-serif" }}>

      {/* Marquee */}
      <div style={{ background: C.bur, padding: "9px 0", overflow: "hidden", whiteSpace: "nowrap", borderTop: `0.5px solid ${C.border}` }}>
        <div className="plp-marquee">
          {[
            "Free Shipping above ₹999", "✦", "Discreet Packaging", "✦",
            "100% Body Safe", "✦", "Easy Returns", "✦", "COD Available", "✦",
            "Free Shipping above ₹999", "✦", "Discreet Packaging", "✦",
            "100% Body Safe", "✦", "Easy Returns", "✦", "COD Available", "✦",
          ].map((txt, i) => (
            <span key={i} style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: txt === "✦" ? C.gold : C.cream, margin: "0 12px" }}>{txt}</span>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: `0.5px solid ${C.border}` }}>
        <Link href="/" style={{ fontSize: 11, color: C.muted, textDecoration: "none", letterSpacing: 0.5 }}>Home</Link>
        <ChevronRight size={10} color={C.muted} style={{ opacity: 0.4 }} />
        <span style={{ fontSize: 11, color: C.gold, letterSpacing: 0.5 }}>Shop All</span>
      </div>

      {/* Search */}
      <div style={{ padding: "14px 16px", borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{
          background: C.mid, border: `0.5px solid ${C.border}`,
          borderRadius: 40, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
        }}>
          <Search size={16} color={C.muted} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: C.text, fontSize: 13, flex: 1, fontFamily: "inherit",
            }}
          />
          {searchInput && (
            <button onClick={handleClearSearch} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X size={16} color={C.muted} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding: "14px 0 14px 16px", borderBottom: `0.5px solid ${C.border}`, overflowX: "auto" }} className="hide-scrollbar">
        <div style={{ display: "flex", gap: 8, width: "max-content", paddingRight: 16 }}>
          {[{ id: "all", name: "All", slug: "all" }, ...categories].map((cat) => {
            const active = selectedCat === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCatClick(cat.slug)}
                style={{
                  padding: "7px 16px", borderRadius: 40,
                  fontSize: 12, fontWeight: active ? 600 : 500, cursor: "pointer",
                  border: `0.5px solid ${active ? C.gold : C.border}`,
                  color: active ? C.dark : C.muted,
                  background: active ? C.gold : "transparent",
                  transition: "all 0.2s", whiteSpace: "nowrap", letterSpacing: 0.5,
                  fontFamily: "inherit",
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ fontSize: 12, color: C.muted }}>
          Showing <span style={{ color: C.gold, fontWeight: 600 }}>{total}</span> products
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
              border: `0.5px solid ${C.border}`, borderRadius: 40,
              background: "transparent", color: C.muted, fontSize: 12,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            <SlidersHorizontal size={14} /> Filter
          </button>
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
              border: `0.5px solid ${C.border}`, borderRadius: 40,
              background: "transparent", color: C.muted, fontSize: 12,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            <ArrowUpDown size={14} /> Sort
          </button>
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div style={{ padding: "10px 16px", display: "flex", gap: 8, overflowX: "auto", borderBottom: `0.5px solid ${C.border}` }} className="hide-scrollbar">
          {activeFilters.map((label) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", background: "rgba(107,26,42,0.3)",
              border: "0.5px solid rgba(107,26,42,0.6)", borderRadius: 40,
              fontSize: 11, color: C.cream, whiteSpace: "nowrap",
            }}>
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div style={{ padding: 16 }}>
        {isLoading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Try adjusting your filters or search for something else.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }} className="plp-grid">
            {products.map((p) => (
              <ProductCardItem
                key={p.id}
                product={p}
                onQuickView={setQuickView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more */}
      {!isLoading && hasMore && (
        <div style={{ padding: "8px 16px 24px", textAlign: "center" }}>
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            style={{
              background: "transparent", color: C.gold, border: `0.5px solid ${C.gold}`,
              padding: "12px 36px", borderRadius: 40, fontSize: 13, fontWeight: 500,
              letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
              transition: "all 0.3s", fontFamily: "inherit",
              opacity: isLoadingMore ? 0.6 : 1,
            }}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
            Showing {products.length} of {total} products
          </p>
        </div>
      )}

      {/* Filter drawer */}
      <FilterDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        onApply={handleApplyFilters}
        sortBy={sortBy}
        priceMin={priceMin}
        priceMax={priceMax}
      />

      {/* Quick view */}
      <QuickViewSheet
        product={quickView}
        onClose={() => setQuickView(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Toast */}
      <Toast msg={toastMsg} visible={toastVisible} />

      <style>{`
        .plp-marquee { display: inline-block; animation: plp-scroll 20s linear infinite; }
        @keyframes plp-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .product-plp-card:hover { border-color: rgba(201,151,58,0.4) !important; transform: translateY(-2px); }
        @media (min-width: 640px) { .plp-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; gap: 16px !important; } }
        @media (min-width: 1024px) { .plp-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
        @media (min-width: 480px) { .qv-sheet-max { max-width: 480px; left: 50% !important; right: auto !important; transform: translateX(-50%) translateY(100%) !important; border-radius: 20px 20px 0 0 !important; }
          .qv-sheet-max[style*="translateY(0)"] { transform: translateX(-50%) translateY(0) !important; } }
      `}</style>
    </div>
  );
}
