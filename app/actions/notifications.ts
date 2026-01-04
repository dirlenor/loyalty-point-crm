"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getPendingSlipCount } from "./slip-submissions";

/**
 * Get count of pending demo topup orders
 */
export async function getPendingTopupCount() {
  const supabase = createServerClient();

  try {
    const { count, error } = await supabase
      .from("demo_topup_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Error counting pending topup orders:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getPendingTopupCount:", error);
    return 0;
  }
}

/**
 * Get count of pending redemptions
 */
export async function getPendingRedemptionsCount() {
  const supabase = createServerClient();

  try {
    const { count, error } = await supabase
      .from("redemptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Error counting pending redemptions:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getPendingRedemptionsCount:", error);
    return 0;
  }
}

/**
 * Get all admin notifications data
 */
export async function getAdminNotifications() {
  try {
    const [pendingSlips, pendingRedemptions, pendingTopups] = await Promise.all([
      getPendingSlipCount(),
      getPendingRedemptionsCount(),
      getPendingTopupCount(),
    ]);

    const total = pendingSlips + pendingRedemptions + pendingTopups;

    return {
      pendingSlips,
      pendingRedemptions,
      pendingTopups,
      total,
    };
  } catch (error) {
    console.error("Error in getAdminNotifications:", error);
    return {
      pendingSlips: 0,
      pendingRedemptions: 0,
      pendingTopups: 0,
      total: 0,
    };
  }
}

