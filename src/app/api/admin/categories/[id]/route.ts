import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const productsCount = await db.product.count({ where: { categoryId: params.id } });
    if (productsCount > 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Cannot delete — ${productsCount} product(s) still use this category` },
        { status: 409 }
      );
    }

    const childrenCount = await db.category.count({ where: { parentId: params.id } });
    if (childrenCount > 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Cannot delete — ${childrenCount} sub-categor${childrenCount === 1 ? "y" : "ies"} exist under this category` },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id: params.id } });
    return NextResponse.json<ApiResponse<null>>({ success: true, data: null });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as { name?: string; slug?: string; parentId?: string | null };
    const category = await db.category.update({
      where: { id: params.id },
      data: { ...(body.name && { name: body.name }), ...(body.slug && { slug: body.slug }), parentId: body.parentId ?? null },
    });
    return NextResponse.json<ApiResponse<typeof category>>({ success: true, data: category });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
