/**
 * Session helper for the admin portal.
 * Reads/validates the session cookie and provides auth utilities for API routes and pages.
 */

import { cookies } from 'next/headers';
import { validateSession, destroySession } from '@/lib/db';

export const SESSION_COOKIE = 'portal_session';
/** 7-day session, sliding renewal on each valid request. */
const SESSION_TTL_DAYS = 7;

/** True when running on localhost (dev) — controls the Secure cookie flag. */
function isLocalDev(): boolean {
  const base = process.env.PUBLIC_BASE_URL || '';
  return base.includes('localhost') || base.includes('127.0.0.1') || !base;
}

/**
 * Check if the current request has a valid session.
 * Use in API routes and server components to gate access.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return validateSession(token);
}

/**
 * Set the session cookie on a Response.
 * Call this after creating a session via createSession().
 */
export function setSessionCookie(token: string, expiresAt: Date): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    `Expires=${expiresAt.toUTCString()}`,
    'SameSite=Strict',
    'HttpOnly',
  ];
  if (!isLocalDev()) parts.push('Secure');
  return parts.join('; ');
}

/** Clear the session cookie (for logout). */
export function clearSessionCookie(): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Strict',
    'HttpOnly',
  ];
  if (!isLocalDev()) parts.push('Secure');
  return parts.join('; ');
}

/** Logout: destroy the session in DB and return the cookie header to clear it. */
export async function logout(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await destroySession(token).catch(() => null);
  }
  return clearSessionCookie();
}
