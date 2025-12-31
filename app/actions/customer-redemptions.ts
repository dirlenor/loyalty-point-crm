"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getCustomerRedemptions(customerId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("redemptions")
    .select(`
      *,
      rewards:reward_id (
        id,
        title,
        points_required,
        image_url
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

