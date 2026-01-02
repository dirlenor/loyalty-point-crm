"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateRedemptionCode } from "@/lib/utils/redemption-code";

export async function getRedemptions() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("redemptions")
    .select(`
      *,
      profiles:customer_id (
        id,
        full_name,
        phone,
        total_points
      ),
      rewards:reward_id (
        id,
        title,
        points_required
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateRedemptionStatus(id: string, status: "pending" | "completed") {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("redemptions")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/redemptions");
    revalidatePath("/admin/verify-redemption");
    return { success: true, message: "อัปเดตสถานะสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ" 
    };
  }
}

/**
 * Verify redemption code and mark as completed
 */
export async function verifyRedemptionCode(code: string) {
  const supabase = createServerClient();

  try {
    // Find redemption by code
    const { data: redemption, error: findError } = await supabase
      .from("redemptions")
      .select(`
        *,
        profiles:customer_id (
          id,
          full_name,
          phone,
          line_user_id
        ),
        rewards:reward_id (
          id,
          title,
          points_required
        )
      `)
      .eq("redemption_code", code.toUpperCase())
      .single();

    if (findError || !redemption) {
      return {
        success: false,
        message: "ไม่พบรหัสนี้ กรุณาตรวจสอบรหัสอีกครั้ง",
        data: null,
      };
    }

    // Check if already completed
    if (redemption.status === "completed") {
      return {
        success: false,
        message: "รหัสนี้ถูกใช้แล้ว",
        data: redemption,
      };
    }

    // Update status to completed
    const { error: updateError } = await supabase
      .from("redemptions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);

    if (updateError) throw updateError;

    // Send LINE notification if customer has LINE User ID
    if (redemption.profiles?.line_user_id) {
      try {
        const { sendLineMessage } = await import("@/lib/line/notify");
        const message = `✅ คุณได้รับรางวัลแล้ว!\n\n📦 รางวัล: ${redemption.rewards?.title || "ไม่ระบุ"}\n\nขอบคุณที่ใช้บริการ 6CAT Point!`;
        await sendLineMessage({
          lineUserId: redemption.profiles.line_user_id,
          message,
        });
      } catch (notifyError) {
        console.error("Failed to send LINE notification:", notifyError);
      }
    }

    revalidatePath("/admin/redemptions");
    revalidatePath("/admin/verify-redemption");
    revalidatePath("/customer/history");

    return {
      success: true,
      message: "ยืนยันการรับรางวัลสำเร็จ",
      data: {
        ...redemption,
        status: "completed",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการยืนยันรหัส",
      data: null,
    };
  }
}

export async function createRedemption(customerId: string, rewardId: string) {
  const supabase = createServerClient();

  try {
    // Check customer points
    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", customerId)
      .single();

    if (customerError) throw customerError;

    // Check reward stock and points required
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("points_required, stock")
      .eq("id", rewardId)
      .single();

    if (rewardError) throw rewardError;

    // Validations
    if (reward.stock <= 0) {
      return { success: false, message: "สินค้าหมดสต็อก" };
    }

    if ((customer.total_points || 0) < reward.points_required) {
      return { success: false, message: "แต้มไม่พอสำหรับแลกรางวัลนี้" };
    }

    // Generate unique redemption code
    let redemptionCode = generateRedemptionCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("redemptions")
        .select("id")
        .eq("redemption_code", redemptionCode)
        .single();

      if (!existing) {
        break; // Code is unique
      }

      redemptionCode = generateRedemptionCode();
      attempts++;
    }

    // Create redemption
    const { error: redemptionError } = await supabase
      .from("redemptions")
      .insert([{
        customer_id: customerId,
        reward_id: rewardId,
        status: "pending",
        redemption_code: redemptionCode,
      }]);

    if (redemptionError) throw redemptionError;

    // Calculate new total points
    const newTotalPoints = (customer.total_points || 0) - reward.points_required;

    // Deduct points
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        total_points: newTotalPoints
      })
      .eq("id", customerId);

    if (updateError) throw updateError;

    // Deduct stock
    const { error: stockError } = await supabase
      .from("rewards")
      .update({ stock: reward.stock - 1 })
      .eq("id", rewardId);

    if (stockError) throw stockError;

    // Get redemption data with code
    const { data: redemptionData } = await supabase
      .from("redemptions")
      .select("redemption_code")
      .eq("customer_id", customerId)
      .eq("reward_id", rewardId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get customer LINE User ID and reward title for notification
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("line_user_id")
      .eq("id", customerId)
      .single();

    const { data: rewardData } = await supabase
      .from("rewards")
      .select("title")
      .eq("id", rewardId)
      .single();

    // Send LINE notification if customer has LINE User ID
    if (customerProfile?.line_user_id && rewardData) {
      try {
        console.log("Sending LINE notification to:", customerProfile.line_user_id);
        const { sendLineMessage, formatRedemptionMessage } = await import(
          "@/lib/line/notify"
        );
        const message = formatRedemptionMessage(
          rewardData.title,
          reward.points_required,
          newTotalPoints,
          redemptionData?.redemption_code
        );
        const result = await sendLineMessage({
          lineUserId: customerProfile.line_user_id,
          message,
        });
        if (result.success) {
          console.log("LINE notification sent successfully");
        } else {
          console.error("LINE notification failed:", result.error);
        }
      } catch (notifyError) {
        // Don't fail the whole operation if notification fails
        console.error("Failed to send LINE notification:", notifyError);
      }
    } else {
      console.log("Customer has no LINE User ID or reward data missing, skipping notification");
    }

    revalidatePath("/store");
    revalidatePath("/admin/redemptions");
    revalidatePath("/customer/store");
    revalidatePath("/customer/dashboard");
    return { success: true, message: "แลกรางวัลสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการแลกรางวัล" 
    };
  }
}

