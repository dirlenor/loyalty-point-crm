"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const slipSubmissionSchema = z.object({
  customerId: z.string().uuid(),
  imageUrl: z.string().url(),
  amount: z.number().nullable().optional(),
  referenceNumber: z.string().nullable().optional(),
  transferDate: z.string().nullable().optional(),
  ocrResult: z.any().nullable().optional(),
  ocrConfidence: z.number().nullable().optional(),
});

/**
 * Create a new slip submission
 */
export async function createSlipSubmission(data: {
  customerId: string;
  imageUrl: string;
  amount?: number | null;
  referenceNumber?: string | null;
  transferDate?: string | null;
  ocrResult?: any;
  ocrConfidence?: number | null;
}) {
  const supabase = createServerClient();

  try {
    const validated = slipSubmissionSchema.parse(data);

    // Calculate points (10% of amount, minimum 1 point)
    const pointsAwarded = validated.amount
      ? Math.max(1, Math.floor(validated.amount * 0.1))
      : null;

    const { data: submission, error } = await supabase
      .from("slip_submissions")
      .insert([
        {
          customer_id: validated.customerId,
          image_url: validated.imageUrl,
          amount: validated.amount,
          reference_number: validated.referenceNumber,
          transfer_date: validated.transferDate
            ? new Date(validated.transferDate).toISOString()
            : null,
          ocr_result: validated.ocrResult,
          ocr_confidence: validated.ocrConfidence,
          status: "pending",
          points_awarded: pointsAwarded,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating slip submission:", error);
      return {
        success: false,
        message: `เกิดข้อผิดพลาด: ${error.message}`,
        data: null,
      };
    }

    revalidatePath("/admin/slip-review");
    revalidatePath("/customer/upload-slip");

    return {
      success: true,
      message: "ส่งสลิปสำเร็จ รอ Admin ตรวจสอบ",
      data: submission,
    };
  } catch (error: any) {
    if (error.errors) {
      return {
        success: false,
        message: error.errors[0].message,
        data: null,
      };
    }
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการส่งสลิป",
      data: null,
    };
  }
}

/**
 * Get all slip submissions (for admin)
 */
export async function getSlipSubmissions(status?: "pending" | "approved" | "rejected") {
  const supabase = createServerClient();

  let query = supabase
    .from("slip_submissions")
    .select(
      `
      *,
      customer:profiles!slip_submissions_customer_id_fkey(
        id,
        full_name,
        phone,
        total_points
      ),
      reviewer:profiles!slip_submissions_reviewed_by_fkey(
        id,
        full_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching slip submissions:", error);
    return { success: false, message: error.message, data: null };
  }

  return { success: true, data, message: null };
}

/**
 * Get slip submissions for a specific customer
 */
export async function getCustomerSlipSubmissions(customerId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("slip_submissions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer slip submissions:", error);
    return { success: false, message: error.message, data: null };
  }

  return { success: true, data, message: null };
}

/**
 * Get count of pending slip submissions
 */
export async function getPendingSlipCount() {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from("slip_submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    console.error("Error counting pending slips:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Approve a slip submission
 */
export async function approveSlipSubmission(
  submissionId: string,
  reviewerId: string,
  pointsOverride?: number | null
) {
  const supabase = createServerClient();

  try {
    // Get submission
    const { data: submission, error: fetchError } = await supabase
      .from("slip_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return {
        success: false,
        message: "ไม่พบข้อมูลสลิป",
      };
    }

    if (submission.status !== "pending") {
      return {
        success: false,
        message: "สลิปนี้ถูกตรวจสอบแล้ว",
      };
    }

    // Calculate points
    const pointsToAward =
      pointsOverride !== null && pointsOverride !== undefined
        ? pointsOverride
        : submission.points_awarded || 0;

    if (pointsToAward <= 0) {
      return {
        success: false,
        message: "ไม่สามารถเพิ่มแต้ม 0 หรือติดลบได้",
      };
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from("slip_submissions")
      .update({
        status: "approved",
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        points_awarded: pointsToAward,
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Error approving slip:", updateError);
      return {
        success: false,
        message: `เกิดข้อผิดพลาด: ${updateError.message}`,
      };
    }

    // Add points to customer
    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", submission.customer_id)
      .single();

    if (customerError || !customer) {
      console.error("Error fetching customer:", customerError);
      return {
        success: false,
        message: "ไม่พบข้อมูลลูกค้า",
      };
    }

    const { error: pointsError } = await supabase
      .from("profiles")
      .update({
        total_points: (customer.total_points || 0) + pointsToAward,
      })
      .eq("id", submission.customer_id);

    if (pointsError) {
      console.error("Error updating points:", pointsError);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเพิ่มแต้ม: ${pointsError.message}`,
      };
    }

    // Create point transaction record
    await supabase.from("point_transactions").insert([
      {
        customer_id: submission.customer_id,
        points: pointsToAward,
        source: "slip_verification",
        slip_submission_id: submissionId,
        created_by: reviewerId,
      },
    ]);

    revalidatePath("/admin/slip-review");
    revalidatePath("/customer/upload-slip");
    revalidatePath("/customer/dashboard");

    return {
      success: true,
      message: "อนุมัติสลิปสำเร็จ และเพิ่มแต้มให้ลูกค้าแล้ว",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Reject a slip submission
 */
export async function rejectSlipSubmission(
  submissionId: string,
  reviewerId: string,
  reason: string
) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("slip_submissions")
      .update({
        status: "rejected",
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", submissionId);

    if (error) {
      console.error("Error rejecting slip:", error);
      return {
        success: false,
        message: `เกิดข้อผิดพลาด: ${error.message}`,
      };
    }

    revalidatePath("/admin/slip-review");
    revalidatePath("/customer/upload-slip");

    return {
      success: true,
      message: "ปฏิเสธสลิปสำเร็จ",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาด",
    };
  }
}

