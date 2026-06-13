import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const where = {
      ...(status && { status: status as never }),
      ...(search && {
        OR: [
          { id: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { name: { contains: search } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { method: true, status: true } },
          _count: { select: { items: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{ orders: typeof orders; total: number; totalPages: number }>>({
      success: true,
      data: { orders, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
