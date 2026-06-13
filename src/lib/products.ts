import { db } from "@/lib/db";

/** Shared rating aggregation — keeps SSR and API responses consistent. */
export async function fetchRatingMap(productIds: string[]): Promise<Record<string, number | null>> {
  if (!productIds.length) return {};
  const aggs = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
  });
  return Object.fromEntries(aggs.map((r) => [r.productId, r._avg.rating]));
}
