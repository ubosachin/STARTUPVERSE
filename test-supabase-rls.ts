import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  const { data, error } = await supabase
    .from("users")
    .insert({
      clerk_id: "test_clerk_id_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      username: "testuser_" + Date.now(),
      role: "builder"
    })
    .select()
    .single();

  console.log("Data:", data);
  console.log("Error object:", error);
  console.log("Stringified Error:", JSON.stringify(error, null, 2));
}

run();
