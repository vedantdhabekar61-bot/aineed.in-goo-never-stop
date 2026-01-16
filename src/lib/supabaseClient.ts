import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase Environment Variables. Authentication will not work.");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);