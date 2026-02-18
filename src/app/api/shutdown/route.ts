import { NextRequest, NextResponse } from 'next/server';

const SHUTDOWN_PASSWORD = process.env.SHUTDOWN_PASSWORD || 'Just_nark0zz_88';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body || {};

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (password !== SHUTDOWN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    console.error('🔴 CRITICAL: Server shutdown initiated via /shutdown endpoint');

    const response = NextResponse.json(
      {
        message: 'Server shutdown initiated',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    // Delay a moment so the response can be sent before exiting
    setTimeout(() => {
      // Exit with non-zero code so Railway treats it as a crash/critical failure
      process.exit(1);
    }, 500);

    return response;
  } catch (error) {
    console.error('Shutdown endpoint error:', error);
    return NextResponse.json({ error: 'Failed to process shutdown request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'POST method required' }, { status: 405 });
}