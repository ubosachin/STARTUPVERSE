export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-5.5"
};

export function hasEnv(...keys: Array<keyof typeof env>) {
  return keys.every((key) => Boolean(env[key]));
}
