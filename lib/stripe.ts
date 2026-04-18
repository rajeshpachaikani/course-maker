import "server-only";
import Stripe from "stripe";
import { getCredentials } from "@/lib/credentials";

export interface StripeConfig {
  secret: string;
  webhookSecret: string | null;
  publishable: string | null;
}

export async function getStripeConfig(): Promise<StripeConfig | null> {
  const creds = await getCredentials([
    "stripe_secret",
    "stripe_webhook_secret",
    "stripe_publishable",
  ] as const);
  if (!creds.stripe_secret) return null;
  return {
    secret: creds.stripe_secret,
    webhookSecret: creds.stripe_webhook_secret ?? null,
    publishable: creds.stripe_publishable ?? null,
  };
}

export async function getStripeClient(): Promise<Stripe | null> {
  const cfg = await getStripeConfig();
  if (!cfg) return null;
  return new Stripe(cfg.secret);
}
