import { NextRequest, NextResponse } from "next/server";
import { getDemoTopupOrder } from "@/app/actions/demo-topup";
import { DEMO_CONFIG } from "@/lib/utils/demo-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Validate demo mode
    if (!DEMO_CONFIG.isEnabled()) {
      return NextResponse.json(
        { success: false, message: "Demo mode is not enabled" },
        { status: 403 }
      );
    }

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const result = await getDemoTopupOrder(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.data.order_id,
        status: result.data.status,
        amount: parseFloat(result.data.amount.toString()),
        pointsAdded: result.data.points_to_add,
        createdAt: result.data.created_at,
        completedAt: result.data.completed_at,
      },
    });
  } catch (error: any) {
    console.error("Error getting demo order:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

