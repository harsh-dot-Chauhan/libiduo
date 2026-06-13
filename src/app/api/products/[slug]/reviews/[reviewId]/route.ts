import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

type Params = { params: { slug: string; reviewId: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const review = await db.review.findUnique({
      where: { id: params.reviewId },
      select: { userId: true },
    });

    if (!review) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Review not found" }, { status: 404 });
    }

    // Users can only delete their own reviews; admins can delete any
    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await db.review.delete({ where: { id: params.reviewId } });

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Review deleted" },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
