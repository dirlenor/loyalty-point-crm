"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const phoneSchema = z.string().regex(/^[0-9]{10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก");

export async function findProfileByPhone(phone: string) {
  const supabase = createServerClient();

  try {
    phoneSchema.parse(phone);
  } catch (error: any) {
    return { success: false, message: error.errors[0].message, data: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, message: "ไม่พบข้อมูลลูกค้า", data: null };
    }
    return { success: false, message: "เกิดข้อผิดพลาด", data: null };
  }

  return { success: true, message: "พบข้อมูลลูกค้า", data };
}

export async function addPoints(profileId: string, points: number) {
  const supabase = createServerClient();

  if (points <= 0) {
    return { success: false, message: "แต้มต้องมากกว่า 0" };
  }

  try {
    // Get current points
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", profileId)
      .single();

    if (fetchError) throw fetchError;

    // Update points
    const { error } = await supabase
      .from("profiles")
      .update({ total_points: (profile.total_points || 0) + points })
      .eq("id", profileId);

    if (error) throw error;

    revalidatePath("/admin/collect-points");
    return { success: true, message: `เพิ่มแต้ม ${points} แต้มสำเร็จ` };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการเพิ่มแต้ม" 
    };
  }
}

export async function createProfile(formData: FormData) {
  const supabase = createServerClient();

  const data = {
    phone: formData.get("phone") as string,
    full_name: formData.get("full_name") as string,
    total_points: 0,
    role: "customer" as const,
  };

  try {
    phoneSchema.parse(data.phone);
    
    if (!data.full_name || data.full_name.trim().length === 0) {
      return { success: false, message: "กรุณากรอกชื่อ" };
    }

    const { error } = await supabase
      .from("profiles")
      .insert([data]);

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว" };
      }
      throw error;
    }

    revalidatePath("/admin/collect-points");
    return { success: true, message: "สร้างโปรไฟล์สำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการสร้างโปรไฟล์" 
    };
  }
}

