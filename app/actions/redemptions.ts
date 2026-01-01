"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    return { success: true, message: "อัปเดตสถานะสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ" 
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

    // Create redemption
    const { error: redemptionError } = await supabase
      .from("redemptions")
      .insert([{
        customer_id: customerId,
        reward_id: rewardId,
        status: "pending",
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
        const { sendLineMessage, formatRedemptionMessage } = await import(
          "@/lib/line/notify"
        );
        const remainingPoints = (customer.total_points || 0) - reward.points_required;
        const message = formatRedemptionMessage(
          rewardData.title,
          reward.points_required,
          newTotalPoints
        );
        await sendLineMessage({
          lineUserId: customerProfile.line_user_id,
          message,
        });
      } catch (notifyError) {
        // Don't fail the whole operation if notification fails
        console.error("Failed to send LINE notification:", notifyError);
      }
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

