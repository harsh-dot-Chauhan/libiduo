import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ success: true, data: addresses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });

  const { isDefault, ...fields } = parsed.data;

  // If this is being set as default, unset all other defaults first
  if (isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  // If this is the first address, make it default automatically
  const count = await db.address.count({ where: { userId: session.user.id } });
  const makeDefault = isDefault || count === 0;

  const address = await db.address.create({
    data: { ...fields, isDefault: makeDefault, userId: session.user.id },
  });

  return NextResponse.json({ success: true, data: address }, { status: 201 });
}
