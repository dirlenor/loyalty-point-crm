/**
 * Idempotency Utilities
 * Prevents duplicate processing of webhooks and transactions
 */

import { createServerClient } from "@/lib/supabase/server";

export interface IdempotencyCheckResult {
  isDuplicate: boolean;
  existingTransactionId?: string;
  existingStatus?: string;
}

/**
 * Check if a transaction has already been processed
 */
export async function checkIdempotency(
  transactionId: string
): Promise<IdempotencyCheckResult> {
  const supabase = createServerClient();

  try {
    // Check in demo_topup_transactions
    const { data: transaction, error } = await supabase
      .from("demo_topup_transactions")
      .select("id, status, order_id")
      .eq("transaction_id", transactionId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found, which is fine
      console.error("Error checking idempotency:", error);
      throw error;
    }

    if (transaction) {
      return {
        isDuplicate: true,
        existingTransactionId: transaction.id,
        existingStatus: transaction.status,
      };
    }

    // Also check in demo_topup_orders by promptpay_transaction_id
    const { data: order, error: orderError } = await supabase
      .from("demo_topup_orders")
      .select("id, status, promptpay_transaction_id")
      .eq("promptpay_transaction_id", transactionId)
      .single();

    if (orderError && orderError.code !== "PGRST116") {
      console.error("Error checking order idempotency:", orderError);
      throw orderError;
    }

    if (order && order.status === "success") {
      return {
        isDuplicate: true,
        existingTransactionId: order.id,
        existingStatus: order.status,
      };
    }

    return { isDuplicate: false };
  } catch (error: any) {
    console.error("Idempotency check failed:", error);
    // On error, assume not duplicate to allow processing
    // But log the error for investigation
    return { isDuplicate: false };
  }
}

/**
 * Mark transaction as processed (for idempotency)
 */
export async function markTransactionProcessed(
  transactionId: string,
  orderId: string,
  status: "success" | "failed" | "refunded",
  webhookPayload: any
): Promise<void> {
  const supabase = createServerClient();

  try {
    // Insert into demo_topup_transactions
    const { error } = await supabase.from("demo_topup_transactions").insert({
      transaction_id: transactionId,
      order_id: orderId,
      amount: webhookPayload.amount,
      status,
      webhook_payload: webhookPayload,
      processed_at: new Date().toISOString(),
    });

    if (error) {
      // If duplicate, that's fine - it means idempotency is working
      if (error.code === "23505") {
        console.log("Transaction already marked as processed (idempotent)");
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error marking transaction as processed:", error);
    throw error;
  }
}

