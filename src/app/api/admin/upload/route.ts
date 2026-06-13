import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<never>>({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "libiduo/products",
      transformation: [{ width: 1200, height: 1200, crop: "limit" }, { quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json<ApiResponse<{ url: string; publicId: string }>>({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
