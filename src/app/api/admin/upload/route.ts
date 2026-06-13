import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/types";
import path from "path";
import fs from "fs/promises";

function isCloudinaryConfigured() {
  return !!(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

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

    if (isCloudinaryConfigured()) {
      const { cloudinary } = await import("@/lib/cloudinary");
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
    }

    // Local fallback: save to public/uploads/products
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
    const url = `/uploads/products/${filename}`;

    return NextResponse.json<ApiResponse<{ url: string; publicId: string }>>({
      success: true,
      data: { url, publicId: filename },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json<ApiResponse<never>>({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
