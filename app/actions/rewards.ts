"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rewardSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อรางวัล"),
  description: z.string().optional(),
  points_required: z.number().int().positive("แต้มต้องมากกว่า 0"),
  stock: z.number().int().min(0, "สต็อกต้องมากกว่าหรือเท่ากับ 0"),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function createReward(formData: FormData) {
  const supabase = createServerClient();

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    points_required: parseInt(formData.get("points_required") as string),
    stock: parseInt(formData.get("stock") as string),
    image_url: formData.get("image_url") as string || null,
  };

  try {
    const validated = rewardSchema.parse(data);
    
    const { error } = await supabase
      .from("rewards")
      .insert([validated]);

    if (error) throw error;

    revalidatePath("/admin/rewards");
    return { success: true, message: "สร้างรางวัลสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการสร้างรางวัล" 
    };
  }
}

export async function updateReward(id: string, formData: FormData) {
  const supabase = createServerClient();

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    points_required: parseInt(formData.get("points_required") as string),
    stock: parseInt(formData.get("stock") as string),
    image_url: formData.get("image_url") as string || null,
  };

  try {
    const validated = rewardSchema.parse(data);
    
    const { error } = await supabase
      .from("rewards")
      .update(validated)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/rewards");
    return { success: true, message: "อัปเดตรางวัลสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตรางวัล" 
    };
  }
}

export async function deleteReward(id: string) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("rewards")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/rewards");
    return { success: true, message: "ลบรางวัลสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการลบรางวัล" 
    };
  }
}

export async function getRewards() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReward(id: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

