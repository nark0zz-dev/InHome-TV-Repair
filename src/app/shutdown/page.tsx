"use client";
import React, { useState } from 'react';

export default function ShutdownPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleShutdown = async () => {
    const password = window.prompt('Enter shutdown password:');
    if (password === null) return; // user cancelled
    if (!password) {
      alert('Password required');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to shutdown the server? This will trigger a critical failure and restart the service.'
    );
    if (!confirmed) return;

    setStatus('sending');

    try {
      const res = await fetch('/api/shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Server shutdown initiated');
        // Show styled overloaded message — server will exit shortly
      } else {
        setStatus('error');
        setMessage(data.error || `Request failed with status ${res.status}`);
        alert(`Shutdown failed: ${data.error || res.status}`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(String(err));
      alert('Network error: ' + String(err));
    }
  };

  return (
    <main style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
    }}>
      <h1 style={{ margin: 0 }}>Server Shutdown</h1>
      <p style={{ maxWidth: 640, textAlign: 'center' }}>
        This page will ask for the shutdown password, confirm the action, and then attempt to trigger a critical server shutdown.
        This action is destructive — only use it if you understand the consequences.
      </p>

      <button
        onClick={handleShutdown}
        disabled={status === 'sending'}
        style={{
          padding: '10px 18px',
          background: '#d93b3b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {status === 'sending' ? 'Sending...' : 'Shutdown Server'}
      </button>

      {status === 'success' && (
        <section style={{
          marginTop: 24,
          width: '100%',
          maxWidth: 720,
          padding: 20,
          background: 'linear-gradient(180deg, #fff3f3, #ffecec)',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          borderRadius: 8,
          color: '#8b0000',
        }}>
          <h2 style={{ marginTop: 0 }}>Server overloaded — critical failure</h2>
          <p>
            The server has been forced into a critical failure state and is currently overloaded. The host will detect the crash and attempt to restart the service.
            If you did not intend this, contact your hosting provider immediately.
          </p>
          <p style={{ fontSize: 12, opacity: 0.85 }}>{message}</p>
        </section>
      )}

      {status === 'error' && (
        <section style={{
          marginTop: 24,
          width: '100%',
          maxWidth: 720,
          padding: 16,
          background: '#fff7e6',
          border: '1px solid #ffd39e',
          borderRadius: 8,
        }}>
          <h3 style={{ marginTop: 0 }}>Error</h3>
          <p>{message}</p>
        </section>
      )}

    </main>
  );
}