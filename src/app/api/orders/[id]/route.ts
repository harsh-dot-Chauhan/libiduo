import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.order.findFirst({
      where: {
        id: params.id,
        // Admins can view any order; users can only view their own
        ...(session.user.role !== "ADMIN" && { userId: session.user.id }),
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: true } },
          },
        },
        payment: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<typeof order>>({ success: true, data: order });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
