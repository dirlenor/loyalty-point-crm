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
    .eq("role", "customer")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, message: "ไม่พบข้อมูลลูกค้า กรุณาตรวจสอบเบอร์โทรศัพท์", data: null };
    }
    console.error("Error finding profile:", error);
    return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}`, data: null };
  }

  if (!data) {
    return { success: false, message: "ไม่พบข้อมูลลูกค้า", data: null };
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
    revalidatePath("/admin/customers");
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

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createServerClient();

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  try {
    if (!full_name || full_name.trim().length === 0) {
      return { success: false, message: "กรุณากรอกชื่อ" };
    }

    phoneSchema.parse(phone);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name, phone })
      .eq("id", id)
      .eq("role", "customer");

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว" };
      }
      throw error;
    }

    revalidatePath("/admin/customers");
    return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" 
    };
  }
}

export async function deleteCustomer(id: string) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("role", "customer");

    if (error) throw error;

    revalidatePath("/admin/customers");
    return { success: true, message: "ลบสมาชิกสำเร็จ" };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการลบสมาชิก" 
    };
  }
}

export async function banCustomer(id: string, banned: boolean) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ banned })
      .eq("id", id)
      .eq("role", "customer");

    if (error) throw error;

    revalidatePath("/admin/customers");
    return { 
      success: true, 
      message: banned ? "ระงับสมาชิกสำเร็จ" : "ยกเลิกการระงับสมาชิกสำเร็จ" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการระงับสมาชิก" 
    };
  }
}

export async function findProfileByLineUserId(lineUserId: string) {
  const supabase = createServerClient();

  if (!lineUserId || lineUserId.trim().length === 0) {
    return { success: false, message: "LINE User ID is required", data: null };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("line_user_id", lineUserId)
      .eq("role", "customer")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, message: "ไม่พบข้อมูลลูกค้า", data: null };
      }
      console.error("Error finding profile by LINE User ID:", error);
      return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}`, data: null };
    }

    if (!data) {
      return { success: false, message: "ไม่พบข้อมูลลูกค้า", data: null };
    }

    return { success: true, message: "พบข้อมูลลูกค้า", data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการค้นหาข้อมูลลูกค้า",
      data: null,
    };
  }
}

export async function findOrCreateProfileByLineUserId(
  lineUserId: string,
  displayName: string
) {
  const supabase = createServerClient();

  if (!lineUserId || lineUserId.trim().length === 0) {
    return { success: false, message: "LINE User ID is required", data: null };
  }

  if (!displayName || displayName.trim().length === 0) {
    return { success: false, message: "Display Name is required", data: null };
  }

  try {
    // Try to find existing profile
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("line_user_id", lineUserId)
      .eq("role", "customer")
      .single();

    // If profile exists, return it
    if (existingProfile && !findError) {
      return { success: true, message: "พบข้อมูลลูกค้า", data: existingProfile };
    }

    // If error is not "not found", return error
    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding profile:", findError);
      return {
        success: false,
        message: `เกิดข้อผิดพลาด: ${findError.message}`,
        data: null,
      };
    }

    // Profile doesn't exist, create new one
    // Generate a unique phone number from LINE User ID for database constraint
    // Format: LINE-{first 10 chars of userId} to ensure uniqueness
    const generatedPhone = `LINE-${lineUserId.substring(0, 10).padEnd(10, '0')}`;
    
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([
        {
          line_user_id: lineUserId,
          full_name: displayName,
          phone: generatedPhone,
          total_points: 0,
          role: "customer",
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating profile:", createError);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการสร้างโปรไฟล์: ${createError.message}`,
        data: null,
      };
    }

    revalidatePath("/admin/customers");
    return {
      success: true,
      message: "สร้างโปรไฟล์ใหม่สำเร็จ",
      data: newProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการค้นหาหรือสร้างโปรไฟล์",
      data: null,
    };
  }
}

