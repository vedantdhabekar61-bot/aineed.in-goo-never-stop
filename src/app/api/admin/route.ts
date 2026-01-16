import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase admin client with the service role key
// IMPORTANT: This key must ONLY be used server-side and never exposed to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Example: Fetch all users (This is an admin-only operation)
    // In a real app, you would likely verify the request authorization header here first.
    const { data, error } = await supabaseAdmin
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