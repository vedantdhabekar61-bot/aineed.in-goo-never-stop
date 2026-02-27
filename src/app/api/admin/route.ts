import { createClient } from "@supabase/supabase-js";

let supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
    );
  }
  return supabaseAdmin;
}

export async function POST() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("users")
      .select("*");

    if (error) {
       return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}