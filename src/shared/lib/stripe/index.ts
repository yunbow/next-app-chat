import Stripe from "stripe";

function buildConfig(): Stripe.StripeConfig {
  const config: Stripe.StripeConfig = { apiVersion: "2026-02-25.clover" };
  const base = process.env.STRIPE_API_BASE_URL;
  if (base) {
    const url = new URL(base);
    config.host = url.hostname;
    config.protocol = url.protocol.replace(":", "") as "http" | "https";
    if (url.port) config.port = parseInt(url.port, 10);
  }
  return config;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, buildConfig());

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    priceAmount: 0,
  },
  basic: {
    name: "Basic",
    priceId: process.env.STRIPE_BASIC_PRICE_ID ?? null,
    priceAmount: 900,
  },
  premium: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    priceAmount: 1900,
  },
} as const;

export type Plan = keyof typeof PLANS;

export function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "basic";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  return "free";
}
