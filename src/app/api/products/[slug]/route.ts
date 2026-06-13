import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProductSchema } from "@/lib/validations/product";
import type { ApiResponse } from "@/types";

type Params = { params: { slug: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const product = await db.product.findFirst({
      where: { slug: params.slug, deletedAt: null, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<typeof product>>({ success: true, data: product });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { images, tags, ...rest } = parsed.data;

    const product = await db.product.update({
      where: { slug: params.slug, deletedAt: null },
      data: {
        ...rest,
        ...(images && { images: JSON.stringify(images) }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      },
    });

    return NextResponse.json<ApiResponse<typeof product>>({ success: true, data: product });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await db.product.update({
      where: { slug: params.slug, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Product deleted" },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
