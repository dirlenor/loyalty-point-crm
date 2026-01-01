import { NextRequest, NextResponse } from "next/server";
import { uploadSlipImage } from "@/lib/supabase/storage";

/**
 * API endpoint for uploading slip image and processing OCR
 * POST /api/upload-slip
 * FormData: { file: File, customerId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customerId = formData.get("customerId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage first (don't wait for OCR)
    const { url: imageUrl, path: imagePath } = await uploadSlipImage(
      file,
      customerId
    );

    // Return immediately - OCR will be done on client-side
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        imagePath,
      },
    });
  } catch (error: any) {
    console.error("Upload slip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload slip",
      },
      { status: 500 }
    );
  }
}

