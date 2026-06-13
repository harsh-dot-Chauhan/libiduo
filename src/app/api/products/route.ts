import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product";
import type { ApiResponse } from "@/types";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = productQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { page, limit, category, minPrice, maxPrice, search, sort } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
        : {}),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc" ? { price: "asc" }
      : sort === "price_desc" ? { price: "desc" }
      : sort === "oldest" ? { createdAt: "asc" }
      : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          isActive: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{ products: typeof products; total: number; page: number; totalPages: number }>>({
      success: true,
      data: { products, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { images, tags, ...rest } = parsed.data;

    const product = await db.product.create({
      data: {
        ...rest,
        images: JSON.stringify(images),
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json<ApiResponse<typeof product>>({ success: true, data: product }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "A product with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
