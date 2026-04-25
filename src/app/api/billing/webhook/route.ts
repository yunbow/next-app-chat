import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, getPlanFromPriceId } from "@/shared/lib/stripe";
import { prisma } from "@/shared/lib/db/prisma";

export const dynamic = "force-dynamic";

function getPeriodEnd(sub: Stripe.Subscription): Date | null {
  const ts = sub.items.data[0]?.current_period_end;
  return ts ? new Date(ts * 1000) : null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.metadata?.userId) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await prisma.subscription.upsert({
        where: { userId: session.metadata.userId },
        create: {
          userId: session.metadata.userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          plan,
          status: sub.status,
          currentPeriodEnd: getPeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          plan,
          status: sub.status,
          currentPeriodEnd: getPeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          stripePriceId: priceId,
          plan,
          status: sub.status,
          currentPeriodEnd: getPeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          plan: "free",
          status: "canceled",
          stripeSubscriptionId: null,
          stripePriceId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
