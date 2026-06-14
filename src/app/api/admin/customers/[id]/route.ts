import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { id: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          payment: { select: { method: true, status: true, amount: true } },
          _count: { select: { items: true } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalSpent = user.orders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);

  // Extract phone from most recent order's shippingAddress JSON
  let phone = "";
  if (user.orders[0]?.shippingAddress) {
    const addr = user.orders[0].shippingAddress as Record<string, string>;
    phone = addr.phone ?? "";
  }

  return NextResponse.json({ success: true, data: { ...user, phone, totalSpent } });
}
