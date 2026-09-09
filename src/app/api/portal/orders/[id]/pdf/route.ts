import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/portal-auth';
import { getDiagnosticOrderById, setOrderPdfKey } from '@/lib/db';
import { renderPdf, buildDefaultTemplateData, type PdfTemplateData } from '@/lib/pdf';
import { uploadMedia, getPresignedUrl, isS3Configured } from '@/lib/s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST: Generate a PDF from template data, upload to S3, update the order. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getDiagnosticOrderById(id).catch(() => null);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Merge user-provided template overrides with defaults from the order.
  const body = await request.json().catch(() => ({}));
  const defaults = buildDefaultTemplateData(order);
  const templateData: PdfTemplateData = { ...defaults, ...body };

  // If tech assessment toggle is off (default), clear the technical fields from the PDF.
  if (!body.includeTechAssessment) {
    templateData.tvRetailPrice = '';
    templateData.identifiedProblems = '';
    templateData.repairPricePrediction = '';
  }

  if (!templateData.verdictText?.trim()) {
    return NextResponse.json({ error: 'Verdict text is required to generate the PDF.' }, { status: 400 });
  }

  // Render the PDF.
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderPdf(templateData);
  } catch (err) {
    console.error('PDF render failed:', err);
    return NextResponse.json({ error: 'Failed to render PDF' }, { status: 500 });
  }

  // Upload to S3 under a pdf-specific prefix.
  if (!isS3Configured()) {
    return NextResponse.json({ error: 'S3 storage not configured' }, { status: 500 });
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const fileName = `diagnostic-${shortId}.pdf`;
  const date = new Date().toISOString().slice(0, 10);

  try {
    // Use a custom key with pdfs/ prefix instead of the default buildKey.
    const { randomUUID } = await import('node:crypto');
    const key = `diagnostics/pdfs/${date}/${shortId}-${randomUUID()}.pdf`;

    // Upload directly using the S3 client.
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'private',
      }),
    );

    // Save the key on the order.
    const updated = await setOrderPdfKey(order.id, key);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pdfS3Key: key });
  } catch (err) {
    console.error('PDF upload failed:', err);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }
}

/** GET: Download/view the generated PDF. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getDiagnosticOrderById(id).catch(() => null);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!order.pdfS3Key) return NextResponse.json({ error: 'No PDF generated yet' }, { status: 404 });

  try {
    const url = await getPresignedUrl(order.pdfS3Key, 300); // 5-minute URL
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('PDF download failed:', err);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
