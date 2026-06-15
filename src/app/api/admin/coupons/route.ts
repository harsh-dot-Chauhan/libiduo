import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ApiResponse } from "@/types";

const createSchema = z.object({
  code:        z.string().min(1).max(32).toUpperCase(),
  discountPct: z.number().int().min(1).max(100),
  label:       z.string().min(1).max(100),
  isActive:    z.boolean().optional().default(true),
  isPublic:    z.boolean().optional().default(false),
  expiresAt:   z.string().datetime().optional().nullable(),
  usageLimit:  z.number().int().min(1).optional().nullable(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json<ApiResponse<typeof coupons>>({ success: true, data: coupons });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { expiresAt, ...rest } = parsed.data;
    const coupon = await db.coupon.create({
      data: { ...rest, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    return NextResponse.json<ApiResponse<typeof coupon>>({ success: true, data: coupon }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
