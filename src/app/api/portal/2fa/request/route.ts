import { NextResponse } from 'next/server';
import { create2faCode, set2faTelegramMessageId, get2faTelegramMessageId } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_DIAGNOSTIC_ADMIN_ID = process.env.TELEGRAM_DIAGNOSTIC_ADMIN_ID || '';
const CODE_TTL_SECONDS = 60;
const DELETE_AFTER_MS = 60_000;

async function telegramApi(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function POST() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_DIAGNOSTIC_ADMIN_ID) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
  }

  // Create the code in the DB.
  const codeRecord = await create2faCode(CODE_TTL_SECONDS).catch((err) => {
    console.error('Failed to create 2FA code:', err);
    return null;
  });

  if (!codeRecord) {
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }

  // Send the code to the admin's Telegram DM.
  const data = await telegramApi('sendMessage', {
    chat_id: TELEGRAM_DIAGNOSTIC_ADMIN_ID,
    text: `🔐 <b>Portal 2FA Code</b>\n\n<code>${codeRecord.code}</code>\n\nExpires in ${CODE_TTL_SECONDS} seconds. This message will be deleted automatically.`,
    parse_mode: 'HTML',
  }).catch((err) => {
    console.error('Failed to send 2FA code via Telegram:', err);
    return null;
  });

  if (data?.result?.message_id) {
    await set2faTelegramMessageId(codeRecord.id, data.result.message_id).catch(() => null);
  }

  // Schedule deletion of the Telegram message after DELETE_AFTER_MS.
  setTimeout(async () => {
    const msgId = await get2faTelegramMessageId(codeRecord.id).catch(() => null);
    if (msgId) {
      await telegramApi('deleteMessage', {
        chat_id: TELEGRAM_DIAGNOSTIC_ADMIN_ID,
        message_id: msgId,
      }).catch(() => null);
    }
  }, DELETE_AFTER_MS);

  return NextResponse.json({
    ok: true,
    expiresAt: codeRecord.expiresAt.toISOString(),
    ttlSeconds: CODE_TTL_SECONDS,
  });
}
