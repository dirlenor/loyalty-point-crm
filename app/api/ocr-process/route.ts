import { NextRequest, NextResponse } from "next/server";
import { performOCR } from "@/lib/ocr/tesseract";
import { parseSlipData } from "@/lib/ocr/parser";

/**
 * API endpoint for OCR processing
 * POST /api/ocr-process
 * Body: { imageDataUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 }
      );
    }

    // Perform OCR
    const ocrResult = await performOCR(imageDataUrl);

    // Parse OCR text to extract structured data
    const parsedData = parseSlipData(ocrResult.text, ocrResult.confidence);

    return NextResponse.json({
      success: true,
      data: {
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
        parsed: parsedData,
        ocrData: ocrResult.data,
      },
    });
  } catch (error: any) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process OCR",
      },
      { status: 500 }
    );
  }
}

