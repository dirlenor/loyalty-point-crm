"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getCustomers() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomerById(id: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (error) throw error;
  return data;
}

