"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const promotionSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อโปรโมชั่น"),
  description: z.string().nullable().optional(),
  image_url: z.union([
    z.string().url(),
    z.literal(""),
    z.null(),
  ]).optional(),
  is_active: z.boolean().default(true),
});

export async function createPromotion(formData: FormData) {
  const supabase = createServerClient();

  const imageUrl = formData.get("image_url") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    image_url: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  };

  try {
    const validated = promotionSchema.parse(data);
    
    const { error } = await supabase
      .from("promotions")
      .insert([validated]);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/customer/promotions");
    return { success: true, message: "สร้างโปรโมชั่นสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการสร้างโปรโมชั่น" 
    };
  }
}

export async function updatePromotion(id: string, formData: FormData) {
  const supabase = createServerClient();

  const imageUrl = formData.get("image_url") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    image_url: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };

  try {
    const validated = promotionSchema.parse(data);
    
    const { error } = await supabase
      .from("promotions")
      .update(validated)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/customer/promotions");
    return { success: true, message: "อัปเดตโปรโมชั่นสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตโปรโมชั่น" 
    };
  }
}

export async function deletePromotion(id: string) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/customer/promotions");
    return { success: true, message: "ลบโปรโมชั่นสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการลบโปรโมชั่น" 
    };
  }
}

export async function getPromotions(activeOnly: boolean = false) {
  const supabase = createServerClient();

  let query = supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getPromotion(id: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getActivePromotionsCount() {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from("promotions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) {
    console.error("Error counting active promotions:", error);
    return 0;
  }

  return count || 0;
}

export async function togglePromotionStatus(id: string, isActive: boolean) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("promotions")
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/customer/promotions");
    return { 
      success: true, 
      message: isActive ? "เปิดการแสดงผลโปรโมชั่นสำเร็จ" : "ปิดการแสดงผลโปรโมชั่นสำเร็จ" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะโปรโมชั่น" 
    };
  }
}

