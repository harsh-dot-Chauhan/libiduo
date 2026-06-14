import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = await db.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.address.delete({ where: { id: params.id } });

  // If deleted address was default, promote the most recent one
  if (address.isDefault) {
    const next = await db.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { id: "desc" },
    });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = await db.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  await db.address.update({ where: { id: params.id }, data: { isDefault: true } });

  return NextResponse.json({ success: true });
}
