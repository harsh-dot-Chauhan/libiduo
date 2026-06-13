import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCart, clearCart, cartKey } from "@/lib/cart";
import { placeOrderSchema } from "@/lib/validations/order";
import { sendOrderConfirmation, orderUrl } from "@/lib/email";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        payment: { select: { method: true, status: true } },
        items: {
          take: 1,
          select: { product: { select: { name: true, images: true } } },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof orders>>({ success: true, data: orders });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { shippingAddress, paymentMethod } = parsed.data;
    const key = cartKey(session.user.id, "user");
    const cart = await getCart(key);

    if (cart.items.length === 0) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    // Validate stock and fetch latest prices from DB in one query
    const productIds = cart.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isActive: true },
      select: { id: true, price: true, stock: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: `Product "${item.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: `"${item.name}" has only ${product.stock} units left` },
          { status: 400 }
        );
      }
    }

    // Calculate total using DB prices (not cached cart prices) to prevent tampering
    const total = cart.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + parseFloat(product.price.toString()) * item.quantity;
    }, 0);

    // Create order + payment + decrement stock atomically
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          total,
          shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: productMap.get(item.productId)!.price,
            })),
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: total,
              currency: "inr",
              status: "PENDING",
            },
          },
        },
        include: {
          items: { include: { product: { select: { name: true, images: true } } } },
          payment: true,
        },
      });

      // Decrement stock
      await Promise.all(
        cart.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    // Clear cart after successful order
    await clearCart(key);

    // Send confirmation email — fire and forget, never blocks response
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });
    if (user) {
      void sendOrderConfirmation(user.email, {
        orderId: order.id,
        customerName: user.name ?? "there",
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unitPrice.toString()),
        })),
        total,
        shippingAddress: shippingAddress as Parameters<typeof sendOrderConfirmation>[1]["shippingAddress"],
        paymentMethod,
        orderUrl: orderUrl(order.id),
      });
    }

    return NextResponse.json<ApiResponse<typeof order>>({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
