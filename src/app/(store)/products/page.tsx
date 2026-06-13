export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { fetchRatingMap } from "@/lib/products";
import PlpInteractive from "@/components/store/PlpInteractive";

export const metadata: Metadata = {
  title: "Shop All — LIBIDUO",
  description: "Browse our full collection. Discreet packaging & delivery across India.",
};

async function getInitialData() {
  const where = { deletedAt: null, isActive: true };

  const [products, categories, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { reviews: { _count: "desc" } },
      take: 8,
      select: {
        id: true, name: true, slug: true, price: true, mrp: true,
        badge: true, stock: true, images: true, tags: true, description: true,
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    db.product.count({ where }),
  ]);

  const ratingMap = await fetchRatingMap(products.map((p) => p.id));

  const enriched = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    mrp: p.mrp?.toString() ?? null,
    avgRating: ratingMap[p.id] ?? null,
    reviewCount: p._count.reviews,
  }));

  return { products: enriched, categories, total, totalPages: Math.ceil(total / 8) };
}

export default async function ProductsPage() {
  const { products, categories, total, totalPages } = await getInitialData();

  return (
    <PlpInteractive
      initialProducts={products}
      categories={categories}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}
