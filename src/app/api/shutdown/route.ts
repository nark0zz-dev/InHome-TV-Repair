export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

/**
 * Aggressive shutdown endpoint
 * - Attempts several strategies to terminate the Node process so hosting platforms
 *   that permit process termination will detect a crash and restart.
 *
 * SECURITY: This is intentionally destructive. Only expose to trusted operators.
 */

const SHUTDOWN_PASSWORD = process.env.SHUTDOWN_PASSWORD || 'Just_nark0zz_88';

function attemptShutdown(reason = 'Triggered via /api/shutdown') {
  // Delay slightly so response can be flushed
  setTimeout(() => {
    try {
      console.error('🔴 CRITICAL SHUTDOWN (process.exit):', reason);
      // graceful exit
      if (typeof process.exit === 'function') process.exit(1);
    } catch (e) {
      console.error('process.exit failed:', e);
    }

    try {
      console.error('🔴 CRITICAL SHUTDOWN (SIGTERM)');
      process.kill(process.pid, 'SIGTERM');
    } catch (e) {
      console.error('SIGTERM failed or not permitted:', e);
    }

    try {
      console.error('🔴 CRITICAL SHUTDOWN (SIGKILL)');
      process.kill(process.pid, 'SIGKILL');
    } catch (e) {
      console.error('SIGKILL failed or not permitted:', e);
    }

    // Throw an uncaught error on the next tick (should kill a normal Node process)
    try {
      setImmediate(() => {
        throw new Error('CRITICAL_SHUTDOWN: uncaught exception');
      });
    } catch (e) {
      console.error('setImmediate throw failed:', e);
    }

    // Last-resort busy loop to saturate CPU (will likely be killed by host)
    try {
      const start = Date.now();
      while (Date.now() - start < 5000) {
        // do some CPU work
        Math.sqrt(Math.random());
      }
    } catch (e) {
      console.error('busy loop errored:', e);
    }
  }, 300);
}

interface ShutdownRequestBody {  
  password: string;  
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with typed handling and robust checks
    let body: ShutdownRequestBody | null = null;
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === 'object' && 'password' in parsed && typeof parsed.password === 'string') {
        body = { password: parsed.password };
      }
    } catch (e) {
      // ignore parse errors and keep body as null
    }

    if (!body || !body.password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (body.password !== SHUTDOWN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    console.error('🔴 CRITICAL: Server shutdown authorized via /shutdown');

    // send response immediately
    const res = NextResponse.json(
      {  
        message: 'Server shutdown initiated',  
        timestamp: new Date().toISOString(),  
      },
      { status: 200 }
    );

    // then trigger aggressive shutdown attempts
    attemptShutdown('Authorized by API call');

    return res;
  } catch (error) {
    console.error('Shutdown endpoint error:', error);
    return NextResponse.json({ error: 'Failed to process shutdown request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'POST method required' }, { status: 405 });
}