import { NextResponse } from 'next/server';
import { logout } from '@/lib/portal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieHeader = await logout();
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', cookieHeader);
  return res;
}
