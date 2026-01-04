import { NextRequest, NextResponse } from "next/server";
import { uploadPromotionImage } from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10 MB max)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10 MB" },
        { status: 400 }
      );
    }

    const { url, path } = await uploadPromotionImage(file);

    return NextResponse.json({
      success: true,
      url,
      path,
    });
  } catch (error: any) {
    console.error("Error uploading promotion image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

