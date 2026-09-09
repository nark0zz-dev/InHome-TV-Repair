/**
 * Resend email client + templates for the Online Diagnostic feature.
 *
 * Required env vars:
 *   RESEND_API_KEY
 *   EMAIL_FROM  e.g. "InHome TV Repair <diagnostics@inhometvrepair.com>"
 *
 * The from domain must be verified in your Resend dashboard. Until it is,
 * you can use Resend's sandbox sender "onboarding@resend.dev" for testing
 * (emails only deliver to your own verified address).
 */

import { Resend } from 'resend';
import type { DiagnosticOrder } from '@/types/diagnostic';

let resend: Resend | null = null;

/** True when Resend is configured. */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Basic email format check — prevents Resend 422 errors on empty/invalid addresses. */
function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getResend(): Resend {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  resend = new Resend(key);
  return resend;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || 'InHome TV Repair <onboarding@resend.dev>';
}

/** Send the initial confirmation email right after a successful $25 payment. */
export async function sendDiagnosticConfirmationEmail(order: DiagnosticOrder): Promise<void> {
  if (!isValidEmail(order.customerEmail)) {
    console.log('No valid customer email on order', order.id, '— skipping confirmation email.');
    return;
  }
  if (!isResendConfigured()) {
    console.log('Resend not configured — skipping confirmation email for order', order.id);
    return;
  }

  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: order.customerEmail as string,
    subject: `We received your $25 TV diagnostic request (#${order.id.slice(0, 8).toUpperCase()})`,
    html: confirmationTemplate(order),
  });

  if (error) {
    console.error('Resend confirmation email failed:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}

/** Send the verdict email when the admin reaches a conclusion in Telegram. */
export async function sendDiagnosticVerdictEmail(order: DiagnosticOrder): Promise<void> {
  if (!isValidEmail(order.customerEmail)) {
    console.log('No valid customer email on order', order.id, '— skipping verdict email.');
    return;
  }
  if (!isResendConfigured()) {
    console.log('Resend not configured — skipping verdict email for order', order.id);
    return;
  }

  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: order.customerEmail as string,
    subject: `Your TV diagnostic verdict is ready (#${order.id.slice(0, 8).toUpperCase()})`,
    html: verdictTemplate(order),
  });

  if (error) {
    console.error('Resend verdict email failed:', error);
    throw new Error(`Failed to send verdict email: ${error.message}`);
  }
}

/**
 * Send the final completion email with the PDF conclusion statement attached.
 * Called when the admin marks an order as complete from the portal.
 */
export async function sendDiagnosticCompletionEmail(
  order: DiagnosticOrder,
  pdfBuffer: Buffer,
): Promise<void> {
  if (!isValidEmail(order.customerEmail)) {
    console.log('No valid customer email on order', order.id, '— skipping completion email.');
    return;
  }
  if (!isResendConfigured()) {
    console.log('Resend not configured — skipping completion email for order', order.id);
    return;
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: order.customerEmail as string,
    subject: `Your TV diagnostic report is attached (#${shortId})`,
    html: completionTemplate(order),
    attachments: [
      {
        filename: `diagnostic-report-${shortId}.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });

  if (error) {
    console.error('Resend completion email failed:', error);
    throw new Error(`Failed to send completion email: ${error.message}`);
  }
}

/* --------------------------------- Templates --------------------------------- */

function confirmationTemplate(order: DiagnosticOrder): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <h1 style="color: #FF5722; margin-bottom: 8px;">We got your diagnostic request!</h1>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(order.customerName)},</p>
    <p style="font-size: 16px; line-height: 1.6;">
      We received your <strong>$25 Online TV Diagnostic</strong> request and payment.
      Our technician is reviewing your photos/video now.
    </p>

    <!-- Receipt box -->
    <div style="background: #1e293b; color: #fff; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: bold;">Receipt</p>
      <p style="margin: 0 0 16px; font-size: 28px; font-weight: 900; letter-spacing: 2px;">#${shortId}</p>
      <div style="border-top: 1px solid #334155; padding-top: 12px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px; font-size: 15px;"><strong style="color: #94a3b8;">Service:</strong> Online TV Diagnostic</p>
        <p style="margin: 0 0 8px; font-size: 15px;"><strong style="color: #94a3b8;">TV:</strong> ${escapeHtml(order.tvBrand || 'Not specified')} ${escapeHtml(order.tvModel || '')}</p>
        <p style="margin: 0 0 8px; font-size: 15px;"><strong style="color: #94a3b8;">Issue:</strong> ${escapeHtml(order.issueDescription)}</p>
      </div>
      <div style="border-top: 1px solid #334155; padding-top: 12px;">
        <p style="margin: 0; font-size: 20px;"><strong style="color: #94a3b8;">Amount paid:</strong> $25.00</p>
      </div>
    </div>

    <div style="background: #FFF3E0; border-left: 4px solid #FF5722; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 15px;"><strong>Save your order number #${shortId}</strong> — you'll need it if you contact us about this diagnostic.</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      <strong>What happens next:</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8;">
      <li>You'll receive your expert verdict within <strong>2 hours</strong>.</li>
      <li>If your TV is repairable, your $25 fee is <strong>100% credited</strong> toward the full repair bill.</li>
      <li>If the issue is unfixable (e.g. a cracked panel), you'll know before spending more.</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6;">
      Questions? Reply to this email or call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
    <p style="font-size: 13px; color: #64748b;">InHome TV Repair &middot; Charlotte, NC &middot; (980) 987-0005</p>
  </body>
</html>`;
}

function verdictTemplate(order: DiagnosticOrder): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const verdict = verdictHeadline(order.status);
  const creditNote =
    order.status === 'verdict_repairable' || order.status === 'booked_in_home' || order.status === 'verdict_custom'
      ? `<div style="background: #DCFCE7; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 8px;">
           <p style="margin: 0; font-size: 16px;"><strong>Your $25 diagnostic fee is credited toward your repair.</strong> Book your in-home visit and we'll deduct it from the final bill.</p>
         </div>`
      : '';

  const nextSteps =
    order.status === 'need_more_info'
      ? `<p style="font-size: 16px; line-height: 1.6;">
           We need a little more detail to give you a confident verdict. Please reply to this email with additional photos or a clearer video showing the issue (e.g. the full screen while the TV is on, any cracks from different angles, the model number sticker on the back).
         </p>`
      : order.status === 'verdict_repairable'
        ? `<p style="font-size: 16px; line-height: 1.6;">Your TV is repairable. Call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a> or reply to this email to schedule your in-home visit.</p>`
        : order.status === 'booked_in_home'
          ? `<p style="font-size: 16px; line-height: 1.6;">We've noted that you'd like to proceed with an in-home visit. We'll be in touch shortly to schedule, or call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a>.</p>`
          : order.status === 'verdict_custom'
            ? `<p style="font-size: 16px; line-height: 1.6;">If you'd like to proceed with a repair, call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a> or reply to this email.</p>`
            : `<p style="font-size: 16px; line-height: 1.6;">Unfortunately this issue isn't economically repairable (typically a cracked panel/matrix where replacement costs exceed a new TV). We've saved you the cost of a service call or parts.</p>`;

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <h1 style="color: #FF5722; margin-bottom: 8px;">Your diagnostic verdict is ready</h1>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(order.customerName)},</p>
    <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 18px;"><strong>Verdict:</strong> ${escapeHtml(verdict)}</p>
      <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">Reference #${shortId}</p>
    </div>
    ${order.verdictNote ? `<p style="font-size: 16px; line-height: 1.6; background: #FFF3E0; padding: 12px; border-radius: 8px;"><strong>Technician note:</strong> ${escapeHtml(order.verdictNote)}</p>` : ''}
    ${creditNote}
    ${nextSteps}
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
    <p style="font-size: 13px; color: #64748b;">InHome TV Repair &middot; Charlotte, NC &middot; (980) 987-0005</p>
  </body>
</html>`;
}

function verdictHeadline(status: DiagnosticOrder['status']): string {
  switch (status) {
    case 'verdict_repairable':
      return 'Repairable — book your in-home visit';
    case 'verdict_unfixable':
      return 'Not economically repairable (likely cracked panel)';
    case 'verdict_custom':
      return 'Your diagnostic conclusion';
    case 'need_more_info':
      return 'We need a bit more info';
    case 'booked_in_home':
      return 'In-home visit requested';
    default:
      return 'Review complete';
  }
}

function completionTemplate(order: DiagnosticOrder): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const isRepairable = order.status === 'verdict_repairable' || order.status === 'booked_in_home' || order.status === 'verdict_custom';
  const verdictText = order.verdictNote || order.customVerdictText || '';

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <h1 style="color: #FF5722; margin-bottom: 8px;">Your diagnostic report is attached</h1>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(order.customerName)},</p>
    <p style="font-size: 16px; line-height: 1.6;">
      Your TV diagnostic conclusion statement is attached to this email as a PDF.
      Please review it for our technician's full assessment of your ${escapeHtml(order.tvBrand || 'TV')}.
    </p>
    <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">Reference</p>
      <p style="margin: 4px 0 0; font-size: 20px; font-weight: 900; letter-spacing: 1px;">#${shortId}</p>
    </div>
    ${verdictText ? `<div style="background: #FFF3E0; border-left: 4px solid #FF5722; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Verdict</p>
      <p style="margin: 0; font-size: 16px; line-height: 1.6;">${escapeHtml(verdictText)}</p>
    </div>` : ''}
    ${isRepairable ? `<div style="background: #DCFCE7; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 16px;"><strong>Your $25 diagnostic fee is credited toward your repair.</strong> Call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a> to schedule your in-home visit.</p>
    </div>` : ''}
    <p style="font-size: 16px; line-height: 1.6;">
      Questions? Reply to this email or call us at <a href="tel:+19809870005" style="color: #FF5722;">(980) 987-0005</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
    <p style="font-size: 13px; color: #64748b;">InHome TV Repair &middot; Charlotte, NC &middot; (980) 987-0005</p>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
