"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_BRANDING } from "@/lib/constants/default-branding";
import type { BrandingConfig } from "@/lib/constants/default-branding";

/**
 * Get tenant settings with default fallback
 * Returns default values if no data exists or query fails
 */
export async function getTenantSettings(): Promise<BrandingConfig> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("tenant_settings")
      .select("*")
      .limit(1)
      .single();

    // If no data or error, return default
    if (error || !data) {
      return {
        shopName: DEFAULT_BRANDING.shopName,
        logoText: DEFAULT_BRANDING.logoText,
        logoImageUrl: null,
        primaryColor: DEFAULT_BRANDING.primaryColor,
        secondaryColor: DEFAULT_BRANDING.secondaryColor,
        lightColor: DEFAULT_BRANDING.lightColor,
      };
    }

    // Return data with defaults for missing fields
    return {
      shopName: data.shop_name || DEFAULT_BRANDING.shopName,
      logoText: data.logo_text || DEFAULT_BRANDING.logoText,
      logoImageUrl: data.logo_image_url || null,
      primaryColor: data.primary_color || DEFAULT_BRANDING.primaryColor,
      secondaryColor: data.secondary_color || DEFAULT_BRANDING.secondaryColor,
      lightColor: data.light_color || DEFAULT_BRANDING.lightColor,
    };
  } catch (error) {
    console.error("Error fetching tenant settings:", error);
    // Return default on any error
    return {
      shopName: DEFAULT_BRANDING.shopName,
      logoText: DEFAULT_BRANDING.logoText,
      logoImageUrl: null,
      primaryColor: DEFAULT_BRANDING.primaryColor,
      secondaryColor: DEFAULT_BRANDING.secondaryColor,
      lightColor: DEFAULT_BRANDING.lightColor,
    };
  }
}

/**
 * Update tenant settings (admin only)
 * Validates input and updates database
 */
export async function updateTenantSettings(formData: FormData) {
  try {
    const supabase = createServerClient();

    // Note: This app doesn't use Supabase Auth for admin authentication
    // RLS policies will handle authorization
    // For now, we'll rely on RLS to check admin role
    // In production, implement proper admin authentication if needed

    // Validate and extract form data
    const shopName = formData.get("shopName") as string;
    const logoText = formData.get("logoText") as string;
    const logoImageUrl = formData.get("logoImageUrl") as string | null;
    const primaryColor = formData.get("primaryColor") as string;
    const secondaryColor = formData.get("secondaryColor") as string | null;
    const lightColor = formData.get("lightColor") as string | null;

    // Validation
    if (!shopName || shopName.trim().length === 0) {
      return { success: false, error: "Shop name is required" };
    }

    if (shopName.length > 50) {
      return { success: false, error: "Shop name must be 50 characters or less" };
    }

    if (logoText && logoText.length > 3) {
      return { success: false, error: "Logo text must be 3 characters or less" };
    }

    // Validate color format (hex) - only validate if value is provided
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (primaryColor && primaryColor.trim() && !hexColorRegex.test(primaryColor.trim())) {
      return { success: false, error: "สีหลักต้องเป็นรูปแบบ hex ที่ถูกต้อง (เช่น #ff4b00)" };
    }

    if (secondaryColor && secondaryColor.trim() && !hexColorRegex.test(secondaryColor.trim())) {
      return { success: false, error: "สีรองต้องเป็นรูปแบบ hex ที่ถูกต้อง" };
    }

    if (lightColor && lightColor.trim() && !hexColorRegex.test(lightColor.trim())) {
      return { success: false, error: "สีอ่อนต้องเป็นรูปแบบ hex ที่ถูกต้อง" };
    }

    // Check if settings exist
    const { data: existing, error: checkError } = await supabase
      .from("tenant_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      console.error("Error checking existing settings:", checkError);
      return { success: false, error: "Failed to check settings" };
    }

    const updateData = {
      shop_name: shopName.trim(),
      logo_text: logoText?.trim() || null,
      logo_image_url: logoImageUrl?.trim() || null,
      primary_color: primaryColor.trim(),
      secondary_color: secondaryColor?.trim() || null,
      light_color: lightColor?.trim() || DEFAULT_BRANDING.lightColor,
    };

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("tenant_settings")
        .update(updateData)
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating tenant settings:", error);
        return { 
          success: false, 
          error: error.message || "Failed to update settings. Please check RLS policies." 
        };
      }
    } else {
      // Insert new
      const { error } = await supabase.from("tenant_settings").insert(updateData);

      if (error) {
        console.error("Error inserting tenant settings:", error);
        return { 
          success: false, 
          error: error.message || "Failed to create settings. Please check RLS policies." 
        };
      }
    }

    // Revalidate all pages that use branding
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/customer", "layout");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating tenant settings:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

