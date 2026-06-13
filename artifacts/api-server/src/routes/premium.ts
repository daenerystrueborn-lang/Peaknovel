import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { CreateCheckoutBody } from "@workspace/api-zod";

const router = Router();

const PLANS = [
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 4.99,
    interval: "month",
    features: [
      "Ad-free reading experience",
      "Early access to new chapters",
      "Unlock all premium chapters",
      "Support your favorite authors",
      "Exclusive reader badge",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 39.99,
    interval: "year",
    features: [
      "Ad-free reading experience",
      "Early access to new chapters",
      "Unlock all premium chapters",
      "Support your favorite authors",
      "Exclusive reader badge",
      "2 months FREE (save 33%)",
    ],
  },
];

router.get("/premium/plans", (_req, res) => {
  res.json(PLANS);
});

router.post("/premium/checkout", requireAuth, async (req, res) => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { planId } = parsed.data;
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) { res.status(400).json({ error: "Invalid plan" }); return; }

  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeKey) {
    res.json({ url: "/premium?demo=1" });
    return;
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeKey);

    const priceId = plan.id === "monthly"
      ? process.env["STRIPE_MONTHLY_PRICE_ID"]
      : process.env["STRIPE_YEARLY_PRICE_ID"];

    if (!priceId) {
      res.json({ url: "/premium?demo=1" });
      return;
    }

    const origin = req.headers.origin ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/premium?success=1`,
      cancel_url: `${origin}/premium?cancelled=1`,
      metadata: { userId: String(req.session.userId), planId },
    });

    res.json({ url: session.url ?? "/premium" });
  } catch (err) {
    res.status(500).json({ error: "Stripe error" });
  }
});

export default router;
