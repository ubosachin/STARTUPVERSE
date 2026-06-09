"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscribeUserAction } from "@/lib/actions/profiles";

const plans = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "For builders and co-founder seekers exploring the ecosystem.",
    features: [
      "Create builder profile",
      "Access matchmaking directory",
      "3 job applications per month",
      "Read feed & comment",
      "Standard messaging (limited)"
    ],
    cta: "Start for free",
    popular: false,
    role: "Builder"
  },
  {
    name: "Founder Pro",
    priceMonthly: 29,
    priceYearly: 23,
    description: "For founders searching for co-founders, advisors, or initial angels.",
    features: [
      "Verified 'Founder' badge",
      "Unlimited matchmaking matches",
      "1 live job posting",
      "Upload pitch deck to room",
      "Unlimited messaging & connections",
      "Match compatibility scoring"
    ],
    cta: "Upgrade to Founder Pro",
    popular: true,
    role: "Founder"
  },
  {
    name: "Investor Pro",
    priceMonthly: 79,
    priceYearly: 63,
    description: "For active angel investors and venture capital syndicates.",
    features: [
      "Verified 'Investor' badge",
      "Access startup fundraising CRM",
      "Unlimited startups watchlist",
      "Check size & thesis filters",
      "Private meeting notes tool",
      "Warm intro request paths"
    ],
    cta: "Upgrade to Investor Pro",
    popular: false,
    role: "Investor"
  },
  {
    name: "Startup Pro",
    priceMonthly: 149,
    priceYearly: 119,
    description: "For venture-backed startups scaling up team size and capital rounds.",
    features: [
      "All Founder Pro features",
      "Unlimited job postings",
      "Deck view reader analytics",
      "Investor deal flow CRM",
      "Co-branding events listings",
      "5 team member seats"
    ],
    cta: "Upgrade to Startup Pro",
    popular: false,
    role: "Founder"
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<typeof plans[number] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleCheckout(plan: typeof plans[number]) {
    if (plan.priceMonthly === 0) {
      alert("You already have access to the Free plan!");
      return;
    }
    setCheckoutPlan(plan);
    setIsSuccess(false);
  }

  async function submitSimulatedPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing delay, then call live action
    setTimeout(async () => {
      try {
        const res = await subscribeUserAction(
          checkoutPlan?.name || "Free",
          checkoutPlan?.role || "builder"
        );
        if (res.success) {
          setIsProcessing(false);
          setIsSuccess(true);
        } else {
          setIsProcessing(false);
          alert(res.error || "Failed to update subscription in database.");
        }
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message || "An unexpected error occurred during checkout.");
      }
    }, 1500);
  }


  return (
    <main className="relative bg-white py-16">
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 size-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center">
          <Badge>
            <Sparkles size={13} className="mr-1 inline text-primary" /> Subscription Plans
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
            Flexible pricing for every builder.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Find co-founders, post open jobs, track investor meetings, and close your next round. Cancel anytime.
          </p>

          {/* Toggle button */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold ${billingCycle === "monthly" ? "text-ink" : "text-muted"}`}>
              Bill Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
              aria-checked={billingCycle === "yearly"}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-ink" : "text-muted"}`}>
              Bill Yearly
              <Badge className="bg-success/15 text-success hover:bg-success/20 py-0.5 px-2 border-0">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col justify-between border transition-all hover:-translate-y-1 hover:shadow-soft duration-300 ${
                  plan.popular ? "border-primary shadow-soft bg-white scale-[1.02]" : "border-border/80 bg-surface/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white border-0 shadow">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-ink">{plan.name}</h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed min-h-[40px]">{plan.description}</p>
                    <div className="mt-6 flex items-baseline">
                      <span className="text-5xl font-semibold tracking-tight text-ink">${price}</span>
                      <span className="text-sm font-semibold text-muted ml-2">/month</span>
                    </div>
                    {billingCycle === "yearly" && price > 0 && (
                      <p className="mt-2 text-xs font-semibold text-success">Billed annually (${price * 12}/yr)</p>
                    )}

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/80">
                          <Check className="text-primary mt-0.5 shrink-0" size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleCheckout(plan)}
                    variant={plan.popular ? "primary" : "secondary"}
                    className="mt-8 w-full py-6 rounded-xl text-sm font-semibold"
                  >
                    {plan.priceMonthly === 0 ? "Get Started" : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Stripe Mock Checkout Modal */}
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white border border-border shadow-soft rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <CardContent className="p-0">
                <div className="border-b border-border bg-surface p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-primary" size={20} />
                    <span className="font-bold tracking-tight">Checkout securely with Stripe</span>
                  </div>
                  <button
                    onClick={() => setCheckoutPlan(null)}
                    className="text-muted hover:text-ink font-semibold text-lg"
                  >
                    ✕
                  </button>
                </div>

                {!isSuccess ? (
                  <form onSubmit={submitSimulatedPayment} className="p-6 space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">Selected Plan</label>
                      <div className="mt-1.5 flex justify-between items-center rounded-xl bg-surface border border-border p-3">
                        <div>
                          <p className="font-bold">{checkoutPlan.name}</p>
                          <p className="text-xs text-muted">Billed {billingCycle}</p>
                        </div>
                        <p className="text-xl font-bold">
                          ${billingCycle === "monthly" ? checkoutPlan.priceMonthly : checkoutPlan.priceYearly}/mo
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="card-name" className="text-xs font-semibold text-muted uppercase tracking-wide">Cardholder Name</label>
                        <input
                          id="card-name"
                          type="text"
                          required
                          placeholder="Alex Builder"
                          className="mt-1 w-full h-11 rounded-xl border border-border bg-white px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-number" className="text-xs font-semibold text-muted uppercase tracking-wide">Card Details</label>
                        <div className="relative mt-1">
                          <input
                            id="card-number"
                            type="text"
                            required
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            className="w-full h-11 rounded-xl border border-border bg-white pl-3 pr-20 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5 text-xs text-muted font-bold">
                            <input
                              aria-label="MM/YY"
                              type="text"
                              required
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-12 border-0 bg-transparent p-0 text-center text-sm focus:ring-0 focus:outline-none placeholder:text-muted"
                            />
                            <input
                              aria-label="CVC"
                              type="password"
                              required
                              placeholder="CVC"
                              maxLength={3}
                              className="w-8 border-0 bg-transparent p-0 text-center text-sm focus:ring-0 focus:outline-none placeholder:text-muted"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-6 rounded-xl flex items-center justify-center gap-2 font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={17} /> Processing payment...
                        </>
                      ) : (
                        `Pay $${billingCycle === "monthly" ? checkoutPlan.priceMonthly : checkoutPlan.priceYearly}`
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="p-8 text-center space-y-5">
                    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Payment Successful!</h3>
                      <p className="mt-2 text-sm text-muted">
                        Thank you for upgrading to <strong>{checkoutPlan.name}</strong>. Your account roles have been updated.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setCheckoutPlan(null);
                        window.location.reload();
                      }}
                      className="w-full py-6 rounded-xl font-semibold"
                    >
                      Return to dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
