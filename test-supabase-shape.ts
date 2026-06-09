import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  const { data: users } = await supabase.from("users").select("id").limit(1);
  if (!users || users.length === 0) return;
  const userId = users[0].id;

  await supabase.from("posts").insert({ user_id: userId, content: "test" });
  await supabase.from("profiles").upsert({ user_id: userId, full_name: "Test User" });

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users (
        username,
        role,
        profiles (
          full_name,
          bio,
          avatar_url
        )
      )
    `)
    .limit(1);

  console.log("Data:", JSON.stringify(data, null, 2));
  if (error) console.log("Error:", error);
}

run();
