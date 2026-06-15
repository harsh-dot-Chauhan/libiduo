export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

type PublicCoupon = { code: string; discountPct: number; label: string };

export async function GET() {
  try {
    const now = new Date();
    const coupons = await db.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { code: true, discountPct: true, label: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json<ApiResponse<PublicCoupon[]>>({ success: true, data: coupons });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
