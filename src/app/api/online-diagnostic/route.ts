import { NextRequest, NextResponse } from 'next/server';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_COUNT,
  MAX_TOTAL_UPLOAD_BYTES,
  DIAGNOSTIC_FEE_CENTS,
} from '@/types/diagnostic';
import { uploadToDiagnosticMedia, isS3Configured } from '@/lib/s3';
import { createDiagnosticOrder, isDbConfigured } from '@/lib/db';
import { createDiagnosticCheckoutSession, isStripeConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set<string>(ALLOWED_MIME_TYPES);

/** Read a single text field from FormData, trimmed. */
function textField(value: FormDataEntryValue | null): string {
  return (typeof value === 'string' ? value : '').trim();
}

export async function POST(request: NextRequest) {
  // Fail fast with a helpful message if backend services aren't configured.
  if (!isS3Configured()) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set S3_* environment variables.' },
      { status: 503 },
    );
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured. Set DATABASE_URL.' },
      { status: 503 },
    );
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not configured. Set STRIPE_* environment variables.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data.' }, { status: 400 });
  }

  const customerName = textField(form.get('customerName'));
  const customerPhone = textField(form.get('customerPhone'));
  const customerEmailRaw = textField(form.get('customerEmail'));
  const tvBrand = textField(form.get('tvBrand')) || null;
  const tvModel = textField(form.get('tvModel')) || null;
  const issueDescription = textField(form.get('issueDescription'));

  // Validate text fields.
  if (!customerName || customerName.length < 2) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }
  if (!customerPhone || customerPhone.replace(/\D/g, '').length !== 10) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit US phone number.' }, { status: 400 });
  }
  // Email is optional — but if provided, it must be valid.
  const customerEmail: string | null = customerEmailRaw || null;
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!issueDescription || issueDescription.length < 10) {
    return NextResponse.json({ error: 'Please describe the issue (at least 10 characters).' }, { status: 400 });
  }

  // Collect uploaded files.
  const files = form.getAll('media').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'Please upload at least one photo or video of the issue.' }, { status: 400 });
  }
  if (files.length > MAX_FILE_COUNT) {
    return NextResponse.json({ error: `Maximum ${MAX_FILE_COUNT} files allowed.` }, { status: 400 });
  }

  // Validate types + total size.
  let totalBytes = 0;
  for (const file of files) {
    if (!ALLOWED.has(file.type) && !hasAllowedExtension(file.name)) {
      return NextResponse.json(
        { error: `File "${file.name}" has an unsupported type. Allowed: PNG, JPG, WebP, MP4, MOV.` },
        { status: 400 },
      );
    }
    totalBytes += file.size;
  }
  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Total upload size exceeds 50 MB. Please upload fewer or smaller files.` },
      { status: 400 },
    );
  }

  // Upload media to S3.
  const media = [];
  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const item = await uploadToDiagnosticMedia(buffer, file.name, file.type || guessMime(file.name), file.size);
      media.push(item);
    }
  } catch (err) {
    console.error('S3 upload failed:', err);
    return NextResponse.json({ error: 'Failed to upload media. Please try again.' }, { status: 500 });
  }

  // Create the order (status: pending_payment).
  let order;
  try {
    order = await createDiagnosticOrder({
      customerName,
      customerPhone,
      customerEmail,
      tvBrand,
      tvModel,
      issueDescription,
      media,
      amountCents: DIAGNOSTIC_FEE_CENTS,
    });
  } catch (err) {
    console.error('DB insert failed:', err);
    return NextResponse.json({ error: 'Failed to create your diagnostic request.' }, { status: 500 });
  }

  // Create the Stripe Embedded Checkout session.
  try {
    const session = await createDiagnosticCheckoutSession({
      orderId: order.id,
      customerEmail,
      customerName,
    });

    const clientSecret = session.client_secret;
    if (!clientSecret) {
      throw new Error('Stripe session missing client_secret');
    }

    return NextResponse.json({
      orderId: order.id,
      clientSecret,
    });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    return NextResponse.json(
      { error: 'Failed to start payment. Your files were uploaded; please try again or call us.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Online Diagnostic API',
    status: 'ready',
    accepts: 'multipart/form-data',
  });
}

const EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
};

function hasAllowedExtension(name: string): boolean {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  return ext in EXT_TO_MIME;
}

function guessMime(name: string): string {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}
