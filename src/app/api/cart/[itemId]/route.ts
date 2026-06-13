import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCart, setCartItem, removeCartItem, cartKey } from "@/lib/cart";
import { updateCartSchema } from "@/lib/validations/cart";
import type { ApiResponse } from "@/types";
import type { Cart } from "@/types/cart";

const GUEST_COOKIE = "gid";

function resolveKey(userId: string | undefined, req: NextRequest): string {
  if (userId) return cartKey(userId, "user");
  const guestId = req.cookies.get(GUEST_COOKIE)?.value;
  if (!guestId) return cartKey("unknown", "guest");
  return cartKey(guestId, "guest");
}

type Params = { params: { itemId: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = updateCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const session = await auth();
    const key = resolveKey(session?.user?.id, req);
    const { quantity } = parsed.data;

    if (quantity === 0) {
      await removeCartItem(key, params.itemId);
    } else {
      const cart = await getCart(key);
      const item = cart.items.find((i) => i.productId === params.itemId);
      if (!item) {
        return NextResponse.json<ApiResponse<never>>({ success: false, error: "Item not in cart" }, { status: 404 });
      }
      await setCartItem(key, { ...item, quantity: Math.min(quantity, item.stock) });
    }

    const updatedCart = await getCart(key);
    return NextResponse.json<ApiResponse<Cart>>({ success: true, data: updatedCart });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const key = resolveKey(session?.user?.id, req);
    await removeCartItem(key, params.itemId);
    const updatedCart = await getCart(key);
    return NextResponse.json<ApiResponse<Cart>>({ success: true, data: updatedCart });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
