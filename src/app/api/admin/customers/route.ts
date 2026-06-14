import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const search = searchParams.get("q") ?? "";
  const limit = 20;

  const where = search
    ? { role: "USER" as const, deletedAt: null, OR: [{ email: { contains: search } }, { name: { contains: search } }] }
    : { role: "USER" as const, deletedAt: null };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { shippingAddress: true, total: true, createdAt: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  // Extract phone from latest order's shippingAddress JSON and compute total spent
  const enriched = await Promise.all(
    users.map(async (u) => {
      const latestOrder = u.orders[0];
      let phone = "";
      if (latestOrder?.shippingAddress) {
        const addr = latestOrder.shippingAddress as Record<string, string>;
        phone = addr.phone ?? "";
      }
      const agg = await db.order.aggregate({
        where: { userId: u.id },
        _sum: { total: true },
      });
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
        totalSpent: agg._sum.total ? parseFloat(agg._sum.total.toString()) : 0,
        lastOrderAt: latestOrder?.createdAt ?? null,
      };
    })
  );

  return NextResponse.json({ success: true, data: enriched, total, page, limit });
}
