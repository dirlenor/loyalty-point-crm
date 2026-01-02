import { NextRequest, NextResponse } from "next/server";
import { WebhookVerifier } from "@/lib/payment/webhook-verifier";
import { checkIdempotency, markTransactionProcessed } from "@/lib/utils/idempotency";
import { processPaymentWebhook } from "@/app/actions/demo-topup";
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

    // Get webhook signature from headers
    const signature = request.headers.get("x-promptpay-signature") || "test_signature";
    const timestamp = request.headers.get("x-promptpay-timestamp") || new Date().toISOString();

    // Parse webhook payload
    const payload = await request.json();

    // In demo mode, skip strict verification for easier testing
    if (DEMO_CONFIG.isEnabled()) {
      console.log("Demo mode: Skipping strict webhook verification");
      // Just validate payload structure
      if (!payload.event || !payload.transactionId || typeof payload.amount !== "number") {
        return NextResponse.json(
          { success: false, message: "Invalid payload structure" },
          { status: 400 }
        );
      }
    } else {
      // Production mode: strict verification
      const verifier = new WebhookVerifier();
      const verification = verifier.verifyWebhook(payload, signature, {
        checkTimestamp: true,
        maxAgeSeconds: 300,
      });

      if (!verification.valid) {
        console.error("Webhook verification failed:", verification.error);
        return NextResponse.json(
          { success: false, message: verification.error || "Invalid webhook" },
          { status: 401 }
        );
      }
    }

    // Check idempotency
    const idempotencyCheck = await checkIdempotency(payload.transactionId);
    if (idempotencyCheck.isDuplicate) {
      console.log("Duplicate webhook detected, returning success (idempotent)");
      return NextResponse.json({
        success: true,
        message: "Webhook already processed",
      });
    }

    // Process payment based on event type
    if (payload.event === "payment.success") {
      const result = await processPaymentWebhook(
        payload.transactionId,
        payload.amount,
        payload
      );

      if (result.success) {
        // Mark transaction as processed
        // result.data.orderId is now the UUID (order.id), not order_id string
        await markTransactionProcessed(
          payload.transactionId,
          result.data?.orderId || "",
          "success",
          payload
        );

        return NextResponse.json({
          success: true,
          message: "Webhook processed successfully",
        });
      } else {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 400 }
        );
      }
    } else if (payload.event === "payment.failed") {
      // Handle failed payment
      await markTransactionProcessed(
        payload.transactionId,
        payload.metadata?.orderId || "",
        "failed",
        payload
      );

      return NextResponse.json({
        success: true,
        message: "Payment failure recorded",
      });
    } else {
      // Unknown event type
      return NextResponse.json(
        { success: false, message: `Unknown event type: ${payload.event}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

