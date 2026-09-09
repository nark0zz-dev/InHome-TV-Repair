import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/portal-auth';
import { updateOrderFromPortal, getDiagnosticOrderById } from '@/lib/db';
import { syncOrderToTelegram } from '@/lib/diagnostic-bot';
import type { DiagnosticStatus } from '@/types/diagnostic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const updates: { status?: DiagnosticStatus; verdictNote?: string | null; notesData?: Record<string, string> | null; verdictCategory?: string | null } = {};
  if (body.status && typeof body.status === 'string') updates.status = body.status as DiagnosticStatus;
  if (body.verdictNote !== undefined) updates.verdictNote = body.verdictNote;
  if (body.notesData !== undefined) updates.notesData = body.notesData;
  if (body.verdictCategory !== undefined) updates.verdictCategory = body.verdictCategory;

  const updated = await updateOrderFromPortal(id, updates).catch(() => null);
  if (!updated) return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });

  // Sync the Telegram admin message to reflect the new state.
  await syncOrderToTelegram(updated).catch((err) =>
    console.error('Telegram sync failed for order', id, err),
  );

  return NextResponse.json({ ok: true, order: updated });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const order = await getDiagnosticOrderById(id).catch(() => null);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ order });
}
