const { createClient } = require("@supabase/supabase-js");

const url = "https://ldsmhpablikbnqmowofw.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkc21ocGFibGlrYm5xbW93b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk3MjQyOCwiZXhwIjoyMDk2NTQ4NDI4fQ.DXFT3hxTkv6gM39KcywTS7ZOSHREJFLL7hkmMDHOV6E";

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}

run();
