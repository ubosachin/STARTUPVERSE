import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-05-27.dahlia"
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid stripe signature" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const clerkId = session.metadata?.clerk_id;

    if (!clerkId) {
      return NextResponse.json({ error: "No clerk_id in metadata" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine plan from metadata
    const plan = (session.metadata?.plan || "founder_pro") as string;
    const tierMap: Record<string, string> = {
      founder_pro: "founder_pro",
      investor_pro: "investor_pro",
      startup_pro: "startup_pro",
      enterprise: "enterprise"
    };
    const tier = tierMap[plan] || "founder_pro";

    // Upsert subscription
    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: tier,
      status: "active",
      updated_at: new Date().toISOString()
    }, { onConflict: "stripe_subscription_id" });

    // Update user subscription tier
    await supabase
      .from("users")
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    console.log(`✅ Subscription created for user ${user.id}: ${tier}`);
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const status = sub.status === "active" ? "active" : sub.status;
    const item = sub.items.data[0];
    const periodStart = item ? item.current_period_start : Math.floor(Date.now() / 1000);
    const periodEnd = item ? item.current_period_end : Math.floor(Date.now() / 1000);

    await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_subscription_id", sub.id);

    console.log(`✅ Subscription updated: ${sub.id} → ${status}`);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", sub.id)
      .select("user_id")
      .single();

    if (subscription) {
      // Downgrade user to free
      await supabase
        .from("users")
        .update({ subscription_tier: "free", updated_at: new Date().toISOString() })
        .eq("id", subscription.user_id);

      // Notify user
      await supabase.from("notifications").insert({
        user_id: subscription.user_id,
        type: "system",
        title: "Subscription cancelled",
        message: "Your StartupVerse Pro subscription has been cancelled. You've been moved to the Free plan.",
        action_url: "/settings"
      });
    }

    console.log(`✅ Subscription cancelled: ${sub.id}`);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (subscription) {
      await supabase.from("notifications").insert({
        user_id: subscription.user_id,
        type: "system",
        title: "Payment failed",
        message: "We couldn't process your subscription payment. Please update your payment method to avoid interruption.",
        action_url: "/settings"
      });
    }
  }

  return NextResponse.json({ received: true });
}
