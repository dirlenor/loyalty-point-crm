"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface HistoryItem {
  id: string;
  type: "redemption" | "point_add" | "topup" | "slip_verification";
  date: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
  };
  description: string;
  points: number;
  pointsChange: number; // positive for add, negative for subtract
  status?: string;
  metadata?: any;
}

/**
 * Get all transaction history (redemptions, point additions, topups)
 */
export async function getAllHistory() {
  const supabase = createServerClient();
  const historyItems: HistoryItem[] = [];

  try {
    // 1. Get redemptions
    const { data: redemptions, error: redemptionsError } = await supabase
      .from("redemptions")
      .select(`
        id,
        created_at,
        status,
        profiles:customer_id (
          id,
          full_name,
          phone
        ),
        rewards:reward_id (
          title,
          points_required
        )
      `)
      .order("created_at", { ascending: false });

    if (!redemptionsError && redemptions) {
      redemptions.forEach((redemption: any) => {
        historyItems.push({
          id: redemption.id,
          type: "redemption",
          date: redemption.created_at,
          customer: {
            id: redemption.profiles?.id || "",
            name: redemption.profiles?.full_name || "ไม่ระบุ",
            phone: redemption.profiles?.phone || null,
          },
          description: `แลกรางวัล: ${redemption.rewards?.title || "ไม่ระบุ"}`,
          points: redemption.rewards?.points_required || 0,
          pointsChange: -(redemption.rewards?.points_required || 0), // negative for redemption
          status: redemption.status,
          metadata: {
            rewardTitle: redemption.rewards?.title,
          },
        });
      });
    }

    // 2. Get point transactions (slip verification, manual, etc.)
    const { data: pointTransactions, error: pointTransactionsError } = await supabase
      .from("point_transactions")
      .select(`
        id,
        points,
        source,
        created_at,
        profiles:customer_id (
          id,
          full_name,
          phone
        ),
        slip_submissions:slip_submission_id (
          amount,
          reference_number
        )
      `)
      .order("created_at", { ascending: false });

    if (!pointTransactionsError && pointTransactions) {
      pointTransactions.forEach((transaction: any) => {
        let description = "";
        if (transaction.source === "slip_verification") {
          description = `ยืนยันสลิปเงินโอน${transaction.slip_submissions?.amount ? `: ${transaction.slip_submissions.amount} บาท` : ""}`;
          if (transaction.slip_submissions?.reference_number) {
            description += ` (${transaction.slip_submissions.reference_number})`;
          }
        } else if (transaction.source === "manual") {
          description = "เพิ่มแต้มโดย Admin";
        } else if (transaction.source === "qr_code") {
          description = "เพิ่มแต้มจาก QR Code";
        } else if (transaction.source === "line_bot") {
          description = "เพิ่มแต้มจาก LINE Bot";
        } else {
          description = `เพิ่มแต้ม (${transaction.source})`;
        }

        historyItems.push({
          id: transaction.id,
          type: transaction.source === "slip_verification" ? "slip_verification" : "point_add",
          date: transaction.created_at,
          customer: {
            id: transaction.profiles?.id || "",
            name: transaction.profiles?.full_name || "ไม่ระบุ",
            phone: transaction.profiles?.phone || null,
          },
          description,
          points: transaction.points,
          pointsChange: transaction.points, // positive for addition
          metadata: {
            source: transaction.source,
            slipAmount: transaction.slip_submissions?.amount,
            referenceNumber: transaction.slip_submissions?.reference_number,
          },
        });
      });
    }

    // 3. Get demo topup orders (only successful ones)
    const { data: topupOrders, error: topupOrdersError } = await supabase
      .from("demo_topup_orders")
      .select(`
        id,
        order_id,
        amount,
        points_to_add,
        status,
        created_at,
        completed_at,
        demo_users:demo_user_id (
          profile_id,
          profiles:profile_id (
            id,
            full_name,
            phone
          )
        )
      `)
      .eq("status", "success")
      .order("completed_at", { ascending: false });

    if (!topupOrdersError && topupOrders) {
      topupOrders.forEach((order: any) => {
        const profile = order.demo_users?.profiles;
        historyItems.push({
          id: order.id,
          type: "topup",
          date: order.completed_at || order.created_at,
          customer: {
            id: profile?.id || "",
            name: profile?.full_name || "ไม่ระบุ",
            phone: profile?.phone || null,
          },
          description: `เติมเงิน Demo Topup: ${order.amount} บาท`,
          points: order.points_to_add,
          pointsChange: order.points_to_add, // positive for topup
          status: order.status,
          metadata: {
            orderId: order.order_id,
            amount: order.amount,
          },
        });
      });
    }

    // Sort by date (newest first)
    historyItems.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return historyItems;
  } catch (error: any) {
    console.error("Error fetching history:", error);
    return [];
  }
}

