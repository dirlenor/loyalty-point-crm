import { NextRequest, NextResponse } from "next/server";
import { uploadSlipImage } from "@/lib/supabase/storage";
import { performOCR } from "@/lib/ocr/tesseract";
import { parseSlipData } from "@/lib/ocr/parser";
import { createServerClient } from "@/lib/supabase/server";

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

    // Upload image to Supabase Storage
    const { url: imageUrl, path: imagePath } = await uploadSlipImage(
      file,
      customerId
    );

    // Convert file to data URL for OCR
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Perform OCR
    let ocrResult;
    let parsedData;
    try {
      ocrResult = await performOCR(dataUrl);
      parsedData = parseSlipData(ocrResult.text, ocrResult.confidence);
    } catch (ocrError: any) {
      console.error("OCR error:", ocrError);
      // Continue even if OCR fails - Admin can review manually
      ocrResult = {
        text: "",
        confidence: 0,
        data: {},
      };
      parsedData = {
        amount: null,
        date: null,
        referenceNumber: null,
        confidence: 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        imagePath,
        ocr: {
          rawText: ocrResult.text,
          confidence: ocrResult.confidence,
          parsed: parsedData,
        },
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

