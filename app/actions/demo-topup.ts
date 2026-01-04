"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEMO_CONFIG } from "@/lib/utils/demo-config";
import { PromptPaySandboxClient } from "@/lib/payment/promptpay-sandbox";
import { format } from "date-fns";

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  const date = format(new Date(), "yyyyMMdd");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DEMO-${date}-${random}`;
}

/**
 * Find or create demo user
 */
export async function findOrCreateDemoUser(profileId?: string, phone?: string, fullName?: string) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    // If profileId provided, try to find existing demo user
    if (profileId) {
      const { data: existing, error: findError } = await supabase
        .from("demo_users")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (findError && findError.code !== "PGRST116") {
        console.error("Error finding demo user by profile_id:", findError);
        throw findError;
      }

      if (existing) {
        return { success: true, data: existing };
      }
    }

    // If phone provided and not LINE- format, try to find by phone
    if (phone && !phone.startsWith("LINE-")) {
      const { data: existing, error: findError } = await supabase
        .from("demo_users")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      if (findError && findError.code !== "PGRST116") {
        console.error("Error finding demo user by phone:", findError);
        throw findError;
      }

      if (existing) {
        // Update profile_id if it was missing
        if (!existing.profile_id && profileId) {
          const { error: updateError } = await supabase
            .from("demo_users")
            .update({ profile_id: profileId })
            .eq("id", existing.id);
          
          if (updateError) {
            console.error("Error updating demo user profile_id:", updateError);
          }
        }
        return { success: true, data: existing };
      }
    }

    // Create new demo user
    // Only use phone if it's a valid phone number (not LINE- format)
    const phoneValue = phone && !phone.startsWith("LINE-") ? phone : null;
    
    const { data: newUser, error } = await supabase
      .from("demo_users")
      .insert({
        profile_id: profileId || null,
        phone: phoneValue,
        full_name: fullName || "Demo User",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating demo user:", error);
      throw error;
    }

    // Create wallet for new user
    const { error: walletError } = await supabase.from("demo_wallets").insert({
      demo_user_id: newUser.id,
      balance: 0,
    });

    if (walletError) {
      console.error("Error creating demo wallet:", walletError);
      // Continue anyway, wallet can be created later
    }

    return { success: true, data: newUser };
  } catch (error: any) {
    console.error("findOrCreateDemoUser error:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้าง demo user",
      data: null,
    };
  }
}

/**
 * Create topup order
 */
export async function createDemoTopupOrder(
  userId: string,
  amount: number,
  phone?: string,
  fullName?: string
) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    // Validate userId
    if (!userId || userId.trim().length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่",
      };
    }

    // Validate amount
    if (amount <= 0 || amount > 100000) {
      return {
        success: false,
        message: "จำนวนเงินต้องอยู่ระหว่าง 1 - 100,000 บาท",
      };
    }

    // Find or create demo user
    const userResult = await findOrCreateDemoUser(userId, phone, fullName);
    if (!userResult.success || !userResult.data) {
      console.error("Failed to find or create demo user:", userResult.message);
      return {
        success: false,
        message: userResult.message || "ไม่สามารถสร้าง demo user ได้ กรุณาลองใหม่อีกครั้ง",
      };
    }

    const demoUser = userResult.data;

    // Calculate points to add
    const pointRate = DEMO_CONFIG.getPointRate();
    const pointsToAdd = Math.floor(amount * pointRate);

    // Generate order ID
    const orderId = generateOrderId();

    // Create order in database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + DEMO_CONFIG.getQrExpiryMinutes());

    const { data: order, error: orderError } = await supabase
      .from("demo_topup_orders")
      .insert({
        order_id: orderId,
        demo_user_id: demoUser.id,
        amount,
        points_to_add: pointsToAdd,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create QR code via PromptPay API
    const promptpayClient = new PromptPaySandboxClient();
    const qrResponse = await promptpayClient.createQrCode({
      amount,
      orderId,
      description: `Demo Topup ${amount} THB`,
      expiryMinutes: DEMO_CONFIG.getQrExpiryMinutes(),
    });

    // Update order with QR code and transaction ID
    const { error: updateError } = await supabase
      .from("demo_topup_orders")
      .update({
        promptpay_transaction_id: qrResponse.transactionId,
        qr_code_url: qrResponse.qrCodeUrl,
        qr_code_data: qrResponse.qrCodeData,
        expires_at: qrResponse.expiresAt,
      })
      .eq("id", order.id);

    if (updateError) throw updateError;

    revalidatePath("/admin/demo-topup");
    revalidatePath("/customer/demo-topup");

    return {
      success: true,
      data: {
        orderId: order.order_id,
        amount,
        pointsToAdd,
        qrCodeUrl: qrResponse.qrCodeUrl,
        qrCodeData: qrResponse.qrCodeData,
        expiresAt: qrResponse.expiresAt,
        transactionId: qrResponse.transactionId,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสร้าง topup order",
    };
  }
}

/**
 * Get topup order by order ID
 */
export async function getDemoTopupOrder(orderId: string) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    const { data, error } = await supabase
      .from("demo_topup_orders")
      .select(`
        *,
        demo_users:demo_user_id (
          id,
          full_name,
          phone
        )
      `)
      .eq("order_id", orderId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "ไม่พบ order",
      data: null,
    };
  }
}

/**
 * Process successful payment webhook
 */
export async function processPaymentWebhook(
  transactionId: string,
  amount: number,
  webhookPayload: any
) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    // Find order by transaction ID
    const { data: order, error: findError } = await supabase
      .from("demo_topup_orders")
      .select("*")
      .eq("promptpay_transaction_id", transactionId)
      .single();

    if (findError || !order) {
      return {
        success: false,
        message: "ไม่พบ order ที่เกี่ยวข้อง",
      };
    }

    // Check if already processed
    if (order.status === "success") {
      return {
        success: true,
        message: "Order already processed (idempotent)",
        data: order,
      };
    }

    // Verify amount matches
    if (Math.abs(parseFloat(order.amount.toString()) - amount) > 0.01) {
      return {
        success: false,
        message: "จำนวนเงินไม่ตรงกัน",
      };
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("demo_topup_orders")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) throw updateError;

    // Add points to demo wallet
    const { data: wallet, error: walletError } = await supabase
      .from("demo_wallets")
      .select("*")
      .eq("demo_user_id", order.demo_user_id)
      .single();

    if (walletError) throw walletError;

    const newBalance = (wallet.balance || 0) + order.points_to_add;

    // Update wallet
    const { error: walletUpdateError } = await supabase
      .from("demo_wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (walletUpdateError) throw walletUpdateError;

    // Log in ledger
    const { error: ledgerError } = await supabase.from("demo_points_ledger").insert({
      demo_user_id: order.demo_user_id,
      demo_wallet_id: wallet.id,
      order_id: order.id,
      transaction_type: "topup",
      points_change: order.points_to_add,
      balance_before: wallet.balance || 0,
      balance_after: newBalance,
      description: `Topup ${order.amount} THB`,
    });

    if (ledgerError) {
      console.error("Error logging to ledger:", ledgerError);
      // Don't fail the whole operation
    }

    // Add points to real profile (total_points)
    const { data: demoUser, error: demoUserError } = await supabase
      .from("demo_users")
      .select("profile_id")
      .eq("id", order.demo_user_id)
      .single();

    let newTotalPoints = 0;
    let lineUserId: string | null = null;

    if (!demoUserError && demoUser?.profile_id) {
      // Get current points and line_user_id from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("total_points, line_user_id")
        .eq("id", demoUser.profile_id)
        .single();

      if (!profileError && profile) {
        newTotalPoints = (profile.total_points || 0) + order.points_to_add;
        lineUserId = profile.line_user_id;

        // Update real profile points
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({
            total_points: newTotalPoints,
          })
          .eq("id", demoUser.profile_id);

        if (updateProfileError) {
          console.error("Error updating profile points:", updateProfileError);
          // Don't fail the whole operation, but log it
        } else {
          console.log(`Added ${order.points_to_add} points to profile ${demoUser.profile_id}`);
        }
      }
    }

    // Send LINE notification if customer has LINE User ID
    if (lineUserId) {
      try {
        const { sendLineMessage, formatPointsAddedMessage } = await import("@/lib/line/notify");
        const message = formatPointsAddedMessage(
          order.points_to_add,
          newTotalPoints,
          `เติมเงิน ${order.amount} บาท`
        );
        const result = await sendLineMessage({
          lineUserId,
          message,
        });

        if (result.success) {
          console.log("LINE notification sent successfully for topup");
        } else {
          console.error("Failed to send LINE notification:", result.error);
          // Don't fail the whole operation
        }
      } catch (notifyError: any) {
        console.error("Error sending LINE notification:", notifyError);
        // Don't fail the whole operation
      }
    } else {
      console.log("No LINE User ID found, skipping notification");
    }

    revalidatePath("/admin/demo-topup");
    revalidatePath("/customer/demo-wallet");
    revalidatePath("/admin/customers");
    revalidatePath("/customer/dashboard");

    return {
      success: true,
      message: "เพิ่ม points สำเร็จ",
      data: {
        orderId: order.id, // Return UUID, not order_id string
        orderIdString: order.order_id, // Keep order_id string for reference
        pointsAdded: order.points_to_add,
        newBalance,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการประมวลผล payment",
    };
  }
}

