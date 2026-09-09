import { NextResponse } from 'next/server';
import { processTelegramUpdate } from '@/lib/telegram-bot';
import { handleDiagnosticCallback, parseDiagnosticCallback, handleDiagnosticMessage } from '@/lib/diagnostic-bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const providedSecret = request.headers.get('x-telegram-bot-api-secret-token');

  if (expectedSecret && expectedSecret !== providedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const update = await request.json();

  // Inline keyboard taps arrive as callback_query. Route diagnostic callbacks
  // to the diagnostic handler; everything else goes to the existing bot.
  if (update?.callback_query?.data && parseDiagnosticCallback(update.callback_query.data)) {
    const ok = await handleDiagnosticCallback(update.callback_query).catch((err) => {
      console.error('Diagnostic callback handling failed:', err);
      return false;
    });
    return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
  }

  // Text messages from the admin (for custom verdict capture).
  if (update?.message?.text) {
    const handled = await handleDiagnosticMessage(update.message).catch((err) => {
      console.error('Diagnostic message handling failed:', err);
      return false;
    });
    if (handled) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    // Not a diagnostic message — fall through to the existing bot.
  }

  const ok = processTelegramUpdate(update);

  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}

export async function GET() {
  return NextResponse.json({
    service: 'Telegram Webhook',
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
}
