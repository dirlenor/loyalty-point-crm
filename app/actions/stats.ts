"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = createServerClient();

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  // Get total points
  const { data: profiles } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("role", "customer");

  const totalPoints = profiles?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

  // Get total redemptions
  const { count: totalRedemptions } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true });

  // Get pending redemptions
  const { count: pendingRedemptions } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Get total rewards
  const { count: totalRewards } = await supabase
    .from("rewards")
    .select("*", { count: "exact", head: true });

  // Get recent redemptions (last 5)
  const { data: recentRedemptions } = await supabase
    .from("redemptions")
    .select(`
      *,
      profiles:customer_id (
        full_name,
        phone
      ),
      rewards:reward_id (
        title,
        points_required
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent rewards (last 5)
  const { data: recentRewards } = await supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get available rewards (with stock > 0)
  const { data: availableRewards } = await supabase
    .from("rewards")
    .select("*")
    .gt("stock", 0)
    .order("points_required", { ascending: true })
    .limit(10);

  // Get active promotions
  const { data: activePromotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    totalCustomers: totalCustomers || 0,
    totalPoints,
    totalRedemptions: totalRedemptions || 0,
    pendingRedemptions: pendingRedemptions || 0,
    totalRewards: totalRewards || 0,
    recentRedemptions: recentRedemptions || [],
    recentRewards: recentRewards || [],
    availableRewards: availableRewards || [],
    activePromotions: activePromotions || [],
  };
}

