import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import {
  getDiagnosticOrderById,
  getDiagnosticOrderByStripeSession,
  markOrderPaid,
  updateOrderEmail,
  abandonOrder,
} from '@/lib/db';
import { sendDiagnosticNotification } from '@/lib/diagnostic-bot';
import { sendDiagnosticConfirmationEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook for the $25 Online Diagnostic.
 *
 * On `checkout.session.completed` we mark the matching order paid, then:
 *   - send the admin a rich Telegram notification with inline verdict buttons
 *   - email the customer a confirmation receipt
 *
 * NOTE: the raw body must be passed unmodified to constructEvent. We read it
 * with `request.text()` (App Router gives us the raw bytes here, not parsed JSON).
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const sessionId = session.id;

      // Prefer metadata lookup; fall back to session id for safety.
      let order = orderId ? await getDiagnosticOrderById(orderId).catch(() => null) : null;
      if (!order && sessionId) {
        order = await getDiagnosticOrderByStripeSession(sessionId).catch(() => null);
      }

      if (!order) {
        console.error('Stripe webhook: no matching order for session', sessionId, 'metadata', session.metadata);
        return NextResponse.json({ received: true, matched: false });
      }

      // Idempotency: ignore if already paid.
      if (order.status === 'paid' || order.status.startsWith('verdict_') || order.status === 'booked_in_home' || order.status === 'need_more_info') {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      const paid = await markOrderPaid({
        orderId: order.id,
        stripeSessionId: sessionId,
        stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      });

      if (!paid) {
        console.error('Stripe webhook: failed to mark order paid', order.id);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // If the customer didn't provide an email upfront, capture it from Stripe.
      let orderForNotifications = paid;
      if (!paid.customerEmail) {
        const stripeEmail = session.customer_details?.email;
        if (stripeEmail) {
          const updated = await updateOrderEmail(order.id, stripeEmail).catch(() => null);
          if (updated) orderForNotifications = updated;
        }
      }

      // Notify admin via Telegram (best-effort; don't fail the webhook on a Telegram outage).
      await sendDiagnosticNotification(orderForNotifications).catch((err) =>
        console.error('Telegram diagnostic notification failed:', err),
      );

      // Email the customer (best-effort; skipped if no email on file).
      await sendDiagnosticConfirmationEmail(orderForNotifications).catch((err) =>
        console.error('Confirmation email failed:', err),
      );
    }

    // Stripe Checkout Session expired — customer never completed payment.
    // Mark the order as abandoned (soft delete) so it stops cluttering the dashboard.
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const sessionId = session.id;

      let order = orderId ? await getDiagnosticOrderById(orderId).catch(() => null) : null;
      if (!order && sessionId) {
        order = await getDiagnosticOrderByStripeSession(sessionId).catch(() => null);
      }

      if (order && order.status === 'pending_payment') {
        await abandonOrder(order.id).catch((err) =>
          console.error('Failed to abandon expired order', order.id, err),
        );
        console.log('Order', order.id.slice(0, 8).toUpperCase(), 'marked abandoned (Stripe session expired).');
      }
    }

    // Acknowledge all other event types so Stripe doesn't retry.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Stripe Webhook',
    status: 'ready',
    listensFor: ['checkout.session.completed', 'checkout.session.expired'],
  });
}
