import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  // Verify Clerk webhook signature using svix
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let evt: { type: string; data: any };
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as { type: string; data: any };
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }


  if (evt.type === "user.created") {
    const { id: clerkId, email_addresses, username, first_name, last_name, image_url, unsafe_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || email?.split("@")[0] || "User";
    const safeUsername = username || email?.split("@")[0] || clerkId.slice(0, 12);
    const selectedRole = unsafe_metadata?.role || "builder";

    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({
        clerk_id: clerkId,
        email,
        username: safeUsername,
        role: selectedRole,
        subscription_tier: "free"
      })
      .select("id")
      .single();

    if (userErr) {
      console.error("Error creating user:", userErr);
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }

    // Create profile record
    const { error: profileErr } = await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: fullName,
      avatar_url: image_url || null
    });

    if (profileErr) {
      console.error("Error creating profile:", profileErr);
    }

    console.log(`✅ Created user ${user.id} for Clerk ID ${clerkId}`);
  }

  if (evt.type === "user.updated") {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(" ");

    // Update email in users table
    if (email) {
      await supabase
        .from("users")
        .update({ email, updated_at: new Date().toISOString() })
        .eq("clerk_id", clerkId);
    }

    // Update profile
    if (fullName || image_url) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      if (user) {
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (fullName) updates.full_name = fullName;
        if (image_url) updates.avatar_url = image_url;
        await supabase.from("profiles").update(updates).eq("user_id", user.id);
      }
    }

    console.log(`✅ Updated user for Clerk ID ${clerkId}`);
  }

  if (evt.type === "user.deleted") {
    const { id: clerkId } = evt.data;
    // Soft delete: mark as inactive rather than hard delete to preserve data integrity
    await supabase
      .from("users")
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq("clerk_id", clerkId);

    console.log(`✅ Soft-deleted user for Clerk ID ${clerkId}`);
  }

  return NextResponse.json({ received: true });
}
