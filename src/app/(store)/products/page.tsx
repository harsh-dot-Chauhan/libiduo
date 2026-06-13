export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { productQuerySchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";
import ProductGrid from "@/components/store/ProductGrid";
import FilterSidebar from "@/components/store/FilterSidebar";
import SortSelect from "@/components/store/SortSelect";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full collection. Filter by category, price, and more. Discreet delivery across India.",
};

type PageProps = { searchParams: Record<string, string | string[] | undefined> };

async function getProducts(searchParams: Record<string, string | string[] | undefined>) {
  const flat = Object.fromEntries(Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const query = productQuerySchema.parse(flat);
  const { page, limit, category, minPrice, maxPrice, search, sort } = query;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null, isActive: true,
    ...(category && { category: { slug: category } }),
    ...(minPrice !== undefined || maxPrice !== undefined ? { price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } } : {}),
    ...(search && { OR: [{ name: { contains: search } }, { description: { contains: search } }] }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, slug: true, price: true, stock: true, images: true, category: { select: { id: true, name: true, slug: true } } } }),
    db.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [{ products, page, totalPages }, categories] = await Promise.all([
    getProducts(searchParams),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0608" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#C9973A", marginBottom: 8 }}>Collection</p>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#F0E6D3" }}>All Products</h1>
        </div>

        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Sidebar */}
          <div style={{ width: 200, flexShrink: 0, display: "none" }} className="lg:block" id="filter-sidebar">
            <Suspense>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>
          <div className="lg:hidden" style={{ marginBottom: 24, width: "100%" }}>
            <Suspense>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#B8A99A", letterSpacing: 0.5 }}>{products.length} products</p>
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>

            <ProductGrid products={products.map((p) => ({ ...p, price: p.price.toString() }))} />

            <div style={{ marginTop: 40 }}>
              <Suspense>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
