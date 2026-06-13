import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendShippingUpdate, orderUrl } from "@/lib/email";
import type { ApiResponse } from "@/types";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]),
});

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          take: 2,
          select: { quantity: true, product: { select: { name: true } } },
        },
      },
    });

    // Send shipping update email when status changes to SHIPPED
    if (parsed.data.status === "SHIPPED") {
      const firstItem = order.items[0];
      const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : "";
      const itemSummary = firstItem
        ? `${firstItem.product.name} x${firstItem.quantity}${extra}`
        : "Your items";

      void sendShippingUpdate(order.user.email, {
        orderId: order.id,
        customerName: order.user.name ?? "there",
        itemSummary,
        orderUrl: orderUrl(order.id),
      });
    }

    return NextResponse.json<ApiResponse<{ id: string; status: string }>>({
      success: true,
      data: { id: order.id, status: order.status },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
