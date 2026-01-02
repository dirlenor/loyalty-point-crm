import { NextRequest, NextResponse } from "next/server";
import { createDemoTopupOrder } from "@/app/actions/demo-topup";
import { DEMO_CONFIG } from "@/lib/utils/demo-config";

export async function POST(request: NextRequest) {
  try {
    // Validate demo mode
    if (!DEMO_CONFIG.isEnabled()) {
      return NextResponse.json(
        { success: false, message: "Demo mode is not enabled" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, amount, phone, fullName } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "amount must be a positive number" },
        { status: 400 }
      );
    }

    // Create topup order
    const result = await createDemoTopupOrder(userId, amount, phone, fullName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error creating demo topup:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

