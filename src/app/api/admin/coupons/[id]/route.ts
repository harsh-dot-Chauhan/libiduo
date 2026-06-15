import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ApiResponse } from "@/types";

const updateSchema = z.object({
  code:        z.string().min(1).max(32).toUpperCase().optional(),
  discountPct: z.number().int().min(1).max(100).optional(),
  label:       z.string().min(1).max(100).optional(),
  isActive:    z.boolean().optional(),
  expiresAt:   z.string().datetime().nullable().optional(),
  usageLimit:  z.number().int().min(1).nullable().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { expiresAt, ...rest } = parsed.data;
    const coupon = await db.coupon.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
      },
    });
    return NextResponse.json<ApiResponse<typeof coupon>>({ success: true, data: coupon });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon code already exists" }, { status: 409 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    await db.coupon.delete({ where: { id: params.id } });
    return NextResponse.json<ApiResponse<null>>({ success: true, data: null });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2025") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
