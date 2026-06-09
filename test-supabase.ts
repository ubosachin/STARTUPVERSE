import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
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
  console.log("Error:", JSON.stringify(error, null, 2));
}

run();
