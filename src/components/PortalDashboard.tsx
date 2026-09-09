'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { DiagnosticOrder, DiagnosticStatus } from '@/types/diagnostic';

interface Props {
  initialOrders: DiagnosticOrder[];
}

const POLL_INTERVAL = 15000; // 15 seconds

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Pending',
  processing: 'Processing',
  awaiting_custom_verdict: 'Custom Verdict Pending',
  verdict_repairable: 'Verdict — Repairable',
  verdict_unfixable: 'Verdict — Unfixable',
  verdict_custom: 'Verdict — Custom',
  need_more_info: 'Need More Info',
  booked_in_home: 'Booked In-Home',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

const STATUS_COLORS: Record<DiagnosticStatus, string> = {
  pending_payment: 'bg-slate-700 text-slate-300',
  paid: 'bg-slate-600 text-slate-200',
  processing: 'bg-primary/20 text-primary',
  awaiting_custom_verdict: 'bg-primary/20 text-primary',
  verdict_repairable: 'bg-emerald-500/20 text-emerald-400',
  verdict_unfixable: 'bg-rose-500/20 text-rose-400',
  verdict_custom: 'bg-violet-500/20 text-violet-400',
  need_more_info: 'bg-orange-500/20 text-orange-400',
  booked_in_home: 'bg-teal-500/20 text-teal-400',
  completed: 'bg-slate-700 text-slate-400',
  abandoned: 'bg-slate-800 text-slate-600',
};

const STATUS_FILTERS: (DiagnosticStatus | 'all')[] = [
  'all',
  'paid',
  'processing',
  'verdict_repairable',
  'verdict_unfixable',
  'verdict_custom',
  'need_more_info',
  'booked_in_home',
  'completed',
  'abandoned',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/** Short verdict category label for completed orders (muted, not as bright as the status tag). */
const VERDICT_CATEGORY_LABELS: Record<string, string> = {
  verdict_repairable: 'Repairable',
  verdict_unfixable: 'Unfixable',
  verdict_custom: 'Custom',
  need_more_info: 'Need More Info',
  booked_in_home: 'Booked In-Home',
};

const VERDICT_CATEGORY_COLORS: Record<string, string> = {
  verdict_repairable: 'bg-emerald-500/10 text-emerald-500/60',
  verdict_unfixable: 'bg-rose-500/10 text-rose-500/60',
  verdict_custom: 'bg-violet-500/10 text-violet-500/60',
  need_more_info: 'bg-orange-500/10 text-orange-500/60',
  booked_in_home: 'bg-teal-500/10 text-teal-500/60',
};

export default function PortalDashboard({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<DiagnosticStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Poll for updates — only when the tab is visible.
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setLastUpdated(new Date());
      }
    } catch {
      // Silent fail — don't disrupt the UI on network errors.
    }
  }, []);

  useEffect(() => {
    setLastUpdated(new Date());

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (interval) return;
      interval = setInterval(fetchOrders, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    // Only poll when the tab is visible.
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Fetch immediately when returning to the tab, then resume polling.
        fetchOrders();
        startPolling();
      }
    };

    if (document.hidden) {
      // Tab started hidden — don't poll until visible.
    } else {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const shortId = o.id.slice(0, 8).toUpperCase();
        return (
          o.customerName.toLowerCase().includes(q) ||
          shortId.includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.tvBrand || '').toLowerCase().includes(q) ||
          (o.tvModel || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const handleLogout = async () => {
    await fetch('/api/portal/2fa/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const pendingCount = orders.filter((o) => o.status === 'paid').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const verdictCount = orders.filter((o) => o.status === 'verdict_repairable' || o.status === 'verdict_unfixable' || o.status === 'verdict_custom').length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-100">Service Portal</h1>
            <p className="text-slate-500 text-xs flex items-center gap-2">
              {orders.length} orders
              {pendingCount > 0 && ` · ${pendingCount} pending`}
              {processingCount > 0 && ` · ${processingCount} processing`}
              {verdictCount > 0 && ` · ${verdictCount} awaiting completion`}
              {lastUpdated && (
                <span className="inline-flex items-center gap-1 text-slate-600">
                  · <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  live
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Search by name, order #, TV model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-slate-950'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list with animations */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-lg font-medium">No orders found.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((order) => {
                const shortId = order.id.slice(0, 8).toUpperCase();
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <Link
                      href={`/portal/orders/${order.id}`}
                      className="block bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-bold text-slate-500">#{shortId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                              {STATUS_LABELS[order.status]}
                            </span>
                            {order.status === 'completed' && order.verdictCategory && VERDICT_CATEGORY_LABELS[order.verdictCategory] && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VERDICT_CATEGORY_COLORS[order.verdictCategory]}`}>
                                {VERDICT_CATEGORY_LABELS[order.verdictCategory]}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-200 truncate group-hover:text-primary transition-colors">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {[order.tvBrand, order.tvModel].filter(Boolean).join(' ') || 'TV not specified'}
                            {' · '}
                            {order.issueDescription.slice(0, 80)}
                            {order.issueDescription.length > 80 ? '...' : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                          {order.completedAt && (
                            <p className="text-xs text-emerald-500 mt-1">Completed {formatDate(order.completedAt)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
