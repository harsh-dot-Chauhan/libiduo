import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReviewSchema } from "@/lib/validations/review";
import type { ApiResponse } from "@/types";

type Params = { params: { slug: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Sign in to leave a review" }, { status: 401 });
    }

    const product = await db.product.findFirst({
      where: { slug: params.slug, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Product not found" }, { status: 404 });
    }

    const existing = await db.review.findFirst({
      where: { userId: session.user.id, productId: product.id },
    });
    if (existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json<ApiResponse<typeof review>>({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
