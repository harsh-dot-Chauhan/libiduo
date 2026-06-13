import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCategorySchema } from "@/lib/validations/category";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, slug: true, parentId: true,
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json<ApiResponse<typeof categories>>({ success: true, data: categories });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { parentId, ...rest } = parsed.data;
    const category = await db.category.create({
      data: { ...rest, parentId: parentId ?? null },
    });
    return NextResponse.json<ApiResponse<typeof category>>({ success: true, data: category }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
