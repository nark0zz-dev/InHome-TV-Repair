import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/portal-auth';
import { getDiagnosticOrderById, markOrderCompleted } from '@/lib/db';
import { sendDiagnosticCompletionEmail, isResendConfigured } from '@/lib/resend';
import { syncOrderToTelegram } from '@/lib/diagnostic-bot';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST: Mark an order as complete — sends the customer email with PDF attached. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getDiagnosticOrderById(id).catch(() => null);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'completed') {
    return NextResponse.json({ error: 'Order is already completed' }, { status: 400 });
  }
  if (!order.pdfS3Key) {
    return NextResponse.json({ error: 'Generate the PDF before completing the order.' }, { status: 400 });
  }

  // Download the PDF from S3.
  let pdfBuffer: Buffer;
  try {
    const s3 = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });

    const response = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: order.pdfS3Key }),
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    pdfBuffer = Buffer.concat(chunks);
  } catch (err) {
    console.error('Failed to download PDF from S3:', err);
    return NextResponse.json({ error: 'Failed to retrieve PDF' }, { status: 500 });
  }

  // Mark the order as completed FIRST — this prevents duplicate emails if the
  // request is retried or a concurrent request comes in (markOrderCompleted only
  // updates rows that aren't already completed).
  const updated = await markOrderCompleted(id).catch(() => null);
  if (!updated) {
    // Order was already completed by a concurrent request — don't send another email.
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  // Send the completion email with the PDF attached.
  let emailSent = false;
  let emailError = '';
  const hasValidEmail = Boolean(order.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail.trim()));

  if (hasValidEmail && isResendConfigured()) {
    try {
      await sendDiagnosticCompletionEmail(updated, pdfBuffer);
      emailSent = true;
    } catch (err) {
      console.error('Completion email failed for order', id, err);
      emailError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  // Sync the Telegram message.
  await syncOrderToTelegram(updated).catch((err) =>
    console.error('Telegram sync failed for order', id, err),
  );

  if (!emailSent && hasValidEmail && isResendConfigured()) {
    return NextResponse.json({
      ok: true,
      warning: `Order completed but email failed: ${emailError}. Call the customer manually.`,
    });
  }

  if (!hasValidEmail) {
    return NextResponse.json({
      ok: true,
      warning: 'Order completed. No valid email on file — call the customer with the verdict.',
    });
  }

  return NextResponse.json({ ok: true });
}
