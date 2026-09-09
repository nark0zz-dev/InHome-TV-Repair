import { NextResponse } from 'next/server';
import { getValid2faCode, mark2faCodeUsed, createSession } from '@/lib/db';
import { setSessionCookie } from '@/lib/portal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code?.trim();

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter a 6-digit code.' }, { status: 400 });
  }

  // Find a valid (unused, not expired) code.
  const codeRecord = await getValid2faCode(code).catch(() => null);
  if (!codeRecord) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 });
  }

  // Mark the code as used (single-use enforcement).
  await mark2faCodeUsed(codeRecord.id).catch(() => null);

  // Create a session.
  const session = await createSession(7).catch((err) => {
    console.error('Failed to create session:', err);
    return null;
  });

  if (!session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  const cookieHeader = setSessionCookie(session.token, session.expiresAt);
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', cookieHeader);
  return res;
}
