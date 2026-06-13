import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCart, setCartItem, cartKey } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validations/cart";
import type { ApiResponse } from "@/types";
import type { Cart } from "@/types/cart";

const GUEST_COOKIE = "gid";

function resolveCartKey(userId: string | undefined, req: NextRequest): string {
  if (userId) return cartKey(userId, "user");
  const guestId = req.cookies.get(GUEST_COOKIE)?.value ?? crypto.randomUUID();
  return cartKey(guestId, "guest");
}

function getGuestId(req: NextRequest): string {
  return req.cookies.get(GUEST_COOKIE)?.value ?? crypto.randomUUID();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const key = resolveCartKey(session?.user?.id, req);
    const cart = await getCart(key);
    return NextResponse.json<ApiResponse<Cart>>({ success: true, data: cart });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    const product = await db.product.findFirst({
      where: { id: productId, deletedAt: null, isActive: true },
      select: { id: true, name: true, slug: true, price: true, images: true, stock: true },
    });

    if (!product) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Not enough stock" }, { status: 400 });
    }

    const session = await auth();
    const guestId = getGuestId(req);
    const key = session?.user?.id ? cartKey(session.user.id, "user") : cartKey(guestId, "guest");

    const currentCart = await getCart(key);
    const existing = currentCart.items.find((i) => i.productId === productId);
    const newQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);

    const images: string[] = JSON.parse(product.images);
    await setCartItem(key, {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price.toString()),
      image: images[0] ?? "",
      quantity: newQty,
      stock: product.stock,
    });

    const updatedCart = await getCart(key);
    const res = NextResponse.json<ApiResponse<Cart>>({ success: true, data: updatedCart });

    if (!session?.user?.id) {
      res.cookies.set(GUEST_COOKIE, guestId, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    }

    return res;
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
