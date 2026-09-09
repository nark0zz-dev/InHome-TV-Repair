/**
 * Stripe client + helpers for the $25 Online Diagnostic.
 *
 * Uses Stripe Checkout with `uiMode: 'embedded'` so the checkout form renders
 * inside our own page via an iframe (Embedded Checkout).
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   PUBLIC_BASE_URL  e.g. https://inhometvrepair.com (used for return_url)
 */

import Stripe from 'stripe';
import { DIAGNOSTIC_FEE_CENTS } from '@/types/diagnostic';

let stripe: Stripe | null = null;

/** True when Stripe server-side keys are configured. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getStripe(): Stripe {
  if (stripe) return stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');

  stripe = new Stripe(key, {
    apiVersion: '2026-08-26.dahlia',
    typescript: true,
    appInfo: { name: 'InHome TV Repair', version: '1.0.0' },
  });
  return stripe;
}

export interface CreateSessionInput {
  orderId: string;
  customerEmail: string | null;
  customerName: string;
}

/**
 * Create an Embedded Checkout Session for a $25 diagnostic.
 * The `orderId` is stored in metadata so the webhook can link back to the order.
 * If no customer email is provided, Stripe collects it during checkout.
 */
export async function createDiagnosticCheckoutSession(
  input: CreateSessionInput,
): Promise<Stripe.Checkout.Session> {
  const s = getStripe();
  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

  return s.checkout.sessions.create({
    ui_mode: 'embedded_page',
    mode: 'payment',
    ...(input.customerEmail ? { customer_email: input.customerEmail } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: DIAGNOSTIC_FEE_CENTS,
          product_data: {
            name: 'Online TV Diagnostic',
            description:
              'Expert remote assessment of your TV issue from photos/video. Verdict within 2 hours. Fee is credited toward a full repair if you book us.',
          },
        },
      },
    ],
    metadata: {
      order_id: input.orderId,
      customer_name: input.customerName,
      service: 'online_diagnostic',
    },
    // {CHECKOUT_SESSION_ID} is replaced by Stripe on redirect.
    // Include order_id so the success page can display it regardless of
    // whether the redirect comes from onComplete or Stripe's return_url.
    return_url: `${baseUrl}/online-diagnostic/success?session_id={CHECKOUT_SESSION_ID}&order_id=${input.orderId}`,
  });
}

/** Retrieve a session by id (used on the success page to confirm payment). */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

/** Verify and construct a Stripe webhook event from the raw body + signature. */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
