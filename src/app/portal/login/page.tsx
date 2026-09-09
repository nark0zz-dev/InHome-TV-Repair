'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'idle' | 'requesting' | 'awaiting' | 'verifying' | 'expired' | 'success' | 'error';

export default function PortalLogin() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown timer.
  useEffect(() => {
    if (phase !== 'awaiting' || !expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setPhase('expired');
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, expiresAt]);

  const requestCode = useCallback(async () => {
    setPhase('requesting');
    setError('');
    setCode('');

    try {
      const res = await fetch('/api/portal/2fa/request', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code.');
        setPhase('error');
        return;
      }
      setExpiresAt(new Date(data.expiresAt));
      setPhase('awaiting');
    } catch {
      setError('Network error. Try again.');
      setPhase('error');
    }
  }, []);

  const verifyCode = useCallback(async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setPhase('verifying');
    setError('');

    try {
      const res = await fetch('/api/portal/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code.');
        setPhase('awaiting');
        return;
      }
      setPhase('success');
      router.push('/portal');
    } catch {
      setError('Network error. Try again.');
      setPhase('awaiting');
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2">Service Portal</h1>
          <p className="text-slate-400 text-sm">Authorized access only.</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          {phase === 'idle' && (
            <button
              onClick={requestCode}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg"
            >
              Request 2FA Code
            </button>
          )}

          {phase === 'requesting' && (
            <div className="text-center text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-slate-600 border-t-primary rounded-full mb-3" />
              <p>Sending code...</p>
            </div>
          )}

          {(phase === 'awaiting' || phase === 'verifying') && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm text-center">
                A 6-digit code was sent to your Telegram. Enter it below.
              </p>
              <p className="text-slate-500 text-xs text-center">
                Expires in <span className="text-primary font-bold">{secondsLeft}s</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                placeholder="000000"
                disabled={phase === 'verifying'}
                className="w-full text-center text-2xl font-bold tracking-[0.5em] bg-slate-900 border border-slate-600 rounded-xl py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                autoFocus
              />
              <button
                onClick={verifyCode}
                disabled={phase === 'verifying' || !/^\d{6}$/.test(code)}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200"
              >
                {phase === 'verifying' ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                onClick={requestCode}
                disabled={phase === 'verifying'}
                className="w-full text-slate-400 hover:text-slate-200 text-sm py-2 transition-colors"
              >
                Resend code
              </button>
            </div>
          )}

          {phase === 'expired' && (
            <div className="space-y-4 text-center">
              <p className="text-red-400 font-bold">2FA Code has expired.</p>
              <button
                onClick={requestCode}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all duration-200"
              >
                Request New Code
              </button>
            </div>
          )}

          {phase === 'success' && (
            <div className="text-center text-green-400">
              <p className="font-bold text-lg">Access granted.</p>
              <p className="text-sm text-slate-400 mt-1">Redirecting...</p>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">
          InHome TV Repair &middot; Internal Portal
        </p>
      </div>
    </div>
  );
}
