import { NextRequest, NextResponse } from "next/server";
import { getDemoWallet } from "@/app/actions/demo-wallet";
import { DEMO_CONFIG } from "@/lib/utils/demo-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Validate demo mode
    if (!DEMO_CONFIG.isEnabled()) {
      return NextResponse.json(
        { success: false, message: "Demo mode is not enabled" },
        { status: 403 }
      );
    }

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const result = await getDemoWallet(userId);

    if (!result.success) {
      const message = "message" in result ? result.message : "ไม่พบ wallet";
      return NextResponse.json(
        { success: false, message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error getting demo wallet:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

