"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEMO_CONFIG } from "@/lib/utils/demo-config";

/**
 * Get demo wallet balance for user
 */
export async function getDemoWallet(userId: string) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    // Find demo user
    const { data: demoUser, error: userError } = await supabase
      .from("demo_users")
      .select("id")
      .or(`profile_id.eq.${userId},id.eq.${userId}`)
      .single();

    if (userError || !demoUser) {
      return {
        success: false,
        message: "ไม่พบ demo user",
        data: null,
      };
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from("demo_wallets")
      .select("*")
      .eq("demo_user_id", demoUser.id)
      .single();

    if (walletError) {
      // Wallet might not exist, create it
      const { data: newWallet, error: createError } = await supabase
        .from("demo_wallets")
        .insert({
          demo_user_id: demoUser.id,
          balance: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        success: true,
        data: {
          userId: demoUser.id,
          balance: 0,
          totalTopups: 0,
          totalPointsEarned: 0,
        },
      };
    }

    // Get statistics
    const { data: orders, error: ordersError } = await supabase
      .from("demo_topup_orders")
      .select("points_to_add, status")
      .eq("demo_user_id", demoUser.id)
      .eq("status", "success");

    const totalTopups = orders?.length || 0;
    const totalPointsEarned =
      orders?.reduce((sum, o) => sum + (o.points_to_add || 0), 0) || 0;

    return {
      success: true,
      data: {
        userId: demoUser.id,
        balance: wallet.balance || 0,
        totalTopups,
        totalPointsEarned,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล wallet",
      data: null,
    };
  }
}

/**
 * Get demo wallet transaction history
 */
export async function getDemoWalletHistory(userId: string, limit: number = 50) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    // Find demo user
    const { data: demoUser, error: userError } = await supabase
      .from("demo_users")
      .select("id")
      .or(`profile_id.eq.${userId},id.eq.${userId}`)
      .single();

    if (userError || !demoUser) {
      return {
        success: false,
        message: "ไม่พบ demo user",
        data: [],
      };
    }

    // Get ledger entries
    const { data: ledger, error: ledgerError } = await supabase
      .from("demo_points_ledger")
      .select(`
        *,
        demo_topup_orders:order_id (
          order_id,
          amount
        )
      `)
      .eq("demo_user_id", demoUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ledgerError) throw ledgerError;

    return {
      success: true,
      data: ledger || [],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงประวัติ",
      data: [],
    };
  }
}

/**
 * Get all demo topup orders for admin
 */
export async function getDemoTopupOrders(status?: string) {
  const supabase = createServerClient();
  DEMO_CONFIG.validateDemoMode();

  try {
    let query = supabase
      .from("demo_topup_orders")
      .select(`
        *,
        demo_users:demo_user_id (
          id,
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล orders",
      data: [],
    };
  }
}

