import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/portal-auth';
import { listDiagnosticOrders } from '@/lib/db';
import type { DiagnosticStatus } from '@/types/diagnostic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET: List all diagnostic orders (excludes abandoned by default). Optional status filter. */
export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get('status') as DiagnosticStatus | null;

  const orders = await listDiagnosticOrders(status || undefined).catch(() => []);
  return NextResponse.json({ orders });
}
