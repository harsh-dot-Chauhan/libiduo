import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

type CouponResult = { pct: number; label: string };

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json() as { code: string };
    if (!code || typeof code !== "string") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Code required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Invalid or inactive coupon" }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon has expired" }, { status: 410 });
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon usage limit reached" }, { status: 410 });
    }

    const result: CouponResult = { pct: coupon.discountPct, label: coupon.label };
    return NextResponse.json<ApiResponse<CouponResult>>({ success: true, data: result });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
