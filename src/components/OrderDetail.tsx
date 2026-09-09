'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DiagnosticOrder, DiagnosticStatus, OrderNotes } from '@/types/diagnostic';
import { VERDICT_PRESETS } from '@/types/diagnostic';

interface Props {
  order: DiagnosticOrder;
}

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

/** Statuses that are "pre-final" — verdict saved but order not completed yet. */
const VERDICT_STATUSES: DiagnosticStatus[] = [
  'verdict_repairable',
  'verdict_unfixable',
  'verdict_custom',
  'need_more_info',
  'booked_in_home',
];

/** Statuses where the admin is actively working on the verdict. */
const PROCESSING_STATUSES: DiagnosticStatus[] = [
  'processing',
  'awaiting_custom_verdict',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function fileIcon(mime: string): string {
  return mime.startsWith('video/') ? '🎬' : '🖼';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Check if a verdict status is "fixable" (determines completion message). */
function isFixableVerdict(status: DiagnosticStatus): boolean {
  return status === 'verdict_repairable' || status === 'verdict_custom' || status === 'booked_in_home';
}

export default function OrderDetail({ order }: Props) {
  const router = useRouter();
  const shortId = order.id.slice(0, 8).toUpperCase();
  const isCompleted = order.status === 'completed';
  const isPending = order.status === 'paid';
  const isProcessing = PROCESSING_STATUSES.includes(order.status);
  const isVerdictStage = VERDICT_STATUSES.includes(order.status);

  // Verdict + notes state
  const [verdictText, setVerdictText] = useState(order.verdictNote || order.customVerdictText || '');
  const [notes, setNotes] = useState<OrderNotes>(order.notesData || {});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [confirmPreset, setConfirmPreset] = useState<{ name: string; text: string } | null>(null);

  // PDF + completion state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(Boolean(order.pdfS3Key));
  const [includeTechAssessment, setIncludeTechAssessment] = useState(false);

  const updateOrder = useCallback(async (updates: Record<string, unknown>) => {
    const res = await fetch(`/api/portal/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save.');
    return data.order as DiagnosticOrder;
  }, [order.id]);

  // Start review: paid → processing
  const handleStartReview = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      await updateOrder({ status: 'processing' });
      setSaving(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start review.');
      setSaving(false);
    }
  }, [updateOrder, router]);

  // Save verdict: processing → verdict_*
  const handleSaveVerdict = useCallback(async (verdictStatus: DiagnosticStatus) => {
    if (!verdictText.trim()) {
      setError('Enter verdict text before saving.');
      return;
    }
    setSaving(true);
    setError('');
    setMsg('');
    try {
      await updateOrder({
        status: verdictStatus,
        verdictNote: verdictText,
        notesData: notes,
        verdictCategory: verdictStatus,
      });
      setSaving(false);
      setMsg('Verdict saved. PDF ready to generate.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save verdict.');
      setSaving(false);
    }
  }, [verdictText, notes, updateOrder, router]);

  // Edit verdict: verdict_* → processing
  const handleEditVerdict = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      await updateOrder({ status: 'processing' });
      setSaving(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert to processing.');
      setSaving(false);
    }
  }, [updateOrder, router]);

  // Generate PDF
  const handleGeneratePdf = useCallback(async () => {
    setGeneratingPdf(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch(`/api/portal/orders/${order.id}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdictText: verdictText,
          additionalNotes: notes.adminNotes || '',
          includeTechAssessment,
          tvRetailPrice: notes.tvRetailPrice || '',
          identifiedProblems: notes.identifiedProblems || '',
          repairPricePrediction: notes.repairPricePrediction || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate PDF.');
        return;
      }
      setPdfGenerated(true);
      setMsg('PDF generated successfully.');
    } catch {
      setError('Network error.');
    } finally {
      setGeneratingPdf(false);
    }
  }, [order.id, verdictText, notes, includeTechAssessment]);

  // Finish order: verdict_* → completed (sends email with PDF)
  const handleFinishOrder = useCallback(async () => {
    setCompleting(true);
    setShowCompleteOverlay(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch(`/api/portal/orders/${order.id}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to complete order.');
        setShowCompleteOverlay(false);
        return;
      }
      setMsg(data.warning || 'Order completed. Customer emailed.');
      // Keep overlay visible briefly to show success, then refresh.
      setTimeout(() => {
        setShowCompleteOverlay(false);
        router.refresh();
      }, 1200);
    } catch {
      setError('Network error.');
      setShowCompleteOverlay(false);
    } finally {
      setCompleting(false);
    }
  }, [order.id, router]);

  const handleLogout = async () => {
    await fetch('/api/portal/2fa/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const handlePresetClick = (preset: { name: string; text: string }) => {
    if (verdictText.trim()) {
      setConfirmPreset(preset);
    } else {
      setVerdictText(preset.text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-black text-slate-100">#{shortId}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
            {order.status === 'completed' && order.verdictCategory && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-500">
                {order.verdictCategory.replace('verdict_', '').replace('_', ' ')}
              </span>
            )}
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Completed banner */}
        {isCompleted && (
          <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <p className="font-bold text-emerald-400 text-lg">This diagnostic was completed successfully!</p>
            <p className="text-emerald-500/70 text-sm mt-2">
              {order.completedAt && `Completed on ${formatDate(order.completedAt)}. `}
              {isFixableVerdict(order.status)
                ? `Please text the customer via phone number ${order.customerPhone} to arrange a visit.`
                : `Please don't forget to send a copy of the verdict to the customer's phone number ${order.customerPhone} (since this isn't automated).`
              }
            </p>
          </section>
        )}

        {/* Customer info */}
        <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Customer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600">Name</p>
              <p className="font-bold text-slate-200">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Phone</p>
              <p className="font-bold text-slate-200">
                <a href={`tel:+1${order.customerPhone.replace(/\D/g, '')}`} className="hover:text-primary">
                  {order.customerPhone}
                </a>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Email</p>
              <p className="font-bold text-slate-200">
                {order.customerEmail ? (
                  <a href={`mailto:${order.customerEmail}`} className="hover:text-primary">{order.customerEmail}</a>
                ) : (
                  <span className="text-slate-600 italic">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Order Date</p>
              <p className="font-bold text-slate-200">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </section>

        {/* TV + Issue */}
        <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">TV & Issue</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600">TV</p>
              <p className="font-bold text-slate-200">
                {[order.tvBrand, order.tvModel].filter(Boolean).join(' ') || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Issue Description</p>
              <p className="text-slate-300 whitespace-pre-wrap">{order.issueDescription}</p>
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            Media ({order.media.length})
          </h2>
          {order.media.length === 0 ? (
            <p className="text-slate-600 italic">No media uploaded.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {order.media.map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <span className="text-2xl">{fileIcon(m.mimeType)}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-300">File {i + 1}</p>
                    <p className="text-xs text-slate-600">{formatSize(m.size)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Unpaid: waiting for payment */}
        {order.status === 'pending_payment' && (
          <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Payment</h2>
            <p className="text-slate-400 text-sm">
              Customer hasn't completed payment yet. No action needed until payment is confirmed.
            </p>
          </section>
        )}

        {/* Abandoned: Stripe session expired */}
        {order.status === 'abandoned' && (
          <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Abandoned</h2>
            <p className="text-slate-500 text-sm">
              Customer never completed payment (Stripe Checkout Session expired). This order is archived and excluded from the dashboard by default.
            </p>
          </section>
        )}

        {/* Pending: Start Review button */}
        {isPending && (
          <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Review</h2>
            <p className="text-slate-400 text-sm mb-4">
              This order hasn't been reviewed yet. Click below to start processing.
            </p>
            <button
              onClick={handleStartReview}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              {saving ? 'Starting...' : 'Start Review'}
            </button>
            {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
          </section>
        )}

        {/* Processing: Verdict input + presets + notes */}
        {isProcessing && (
          <>
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Verdict</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Verdict Text</label>
                  <textarea
                    value={verdictText}
                    onChange={(e) => setVerdictText(e.target.value)}
                    rows={6}
                    placeholder="Enter your diagnostic conclusion..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                  />
                </div>

                {/* Preset buttons */}
                <div>
                  <p className="text-xs text-slate-600 mb-2">Quick-fill templates:</p>
                  <div className="flex flex-wrap gap-2">
                    {VERDICT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          preset.category === 'fixable'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:border-rose-500/40'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleSaveVerdict('verdict_repairable')}
                    disabled={saving || !verdictText.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {saving ? 'Saving...' : 'Save as Repairable'}
                  </button>
                  <button
                    onClick={() => handleSaveVerdict('verdict_unfixable')}
                    disabled={saving || !verdictText.trim()}
                    className="bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {saving ? 'Saving...' : 'Save as Unfixable'}
                  </button>
                  <button
                    onClick={() => handleSaveVerdict('verdict_custom')}
                    disabled={saving || !verdictText.trim()}
                    className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {saving ? 'Saving...' : 'Save as Custom'}
                  </button>
                </div>
              </div>
            </section>

            {/* Notes section */}
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">TV Retail Price</label>
                    <input
                      type="text"
                      value={notes.tvRetailPrice || ''}
                      onChange={(e) => setNotes({ ...notes, tvRetailPrice: e.target.value })}
                      placeholder="e.g. $400"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Repair Price Prediction</label>
                    <input
                      type="text"
                      value={notes.repairPricePrediction || ''}
                      onChange={(e) => setNotes({ ...notes, repairPricePrediction: e.target.value })}
                      placeholder="e.g. $150-200"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Identified Problems</label>
                  <textarea
                    value={notes.identifiedProblems || ''}
                    onChange={(e) => setNotes({ ...notes, identifiedProblems: e.target.value })}
                    rows={3}
                    placeholder="List the problems identified during diagnosis..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Freeform Notes</label>
                  <textarea
                    value={notes.adminNotes || ''}
                    onChange={(e) => setNotes({ ...notes, adminNotes: e.target.value })}
                    rows={4}
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Notes are saved automatically when you save the verdict. They'll be included in the PDF.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Verdict stage: read-only verdict + PDF + finish */}
        {isVerdictStage && (
          <>
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Verdict</h2>
                <button
                  onClick={handleEditVerdict}
                  disabled={saving}
                  className="text-primary hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  {saving ? 'Reverting...' : '✏️ Edit'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-slate-300 whitespace-pre-wrap">
                  {order.verdictNote || order.customVerdictText || 'No verdict text.'}
                </p>
              </div>
            </section>

            {/* Notes section (read-only on verdict stage) */}
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">TV Retail Price</p>
                    <p className="text-slate-300">{notes.tvRetailPrice || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Repair Price Prediction</p>
                    <p className="text-slate-300">{notes.repairPricePrediction || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Identified Problems</p>
                  <p className="text-slate-300 whitespace-pre-wrap">{notes.identifiedProblems || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Freeform Notes</p>
                  <p className="text-slate-300 whitespace-pre-wrap">{notes.adminNotes || '—'}</p>
                </div>
              </div>
            </section>

            {/* PDF section */}
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">PDF Conclusion Statement</h2>
              {pdfGenerated ? (
                <div className="space-y-3">
                  <p className="text-emerald-400 text-sm font-medium">
                    PDF generated{order.pdfGeneratedAt && ` on ${formatDate(order.pdfGeneratedAt)}`}
                  </p>
                  <a
                    href={`/api/portal/orders/${order.id}/pdf`}
                    target="_blank"
                    className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg text-sm transition-all"
                  >
                    Download / View PDF
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">Generate the PDF conclusion statement to attach to the customer email.</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setIncludeTechAssessment(!includeTechAssessment)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${includeTechAssessment ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${includeTechAssessment ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-sm text-slate-300">Include technical assessment (TV price, repair cost, problems) in the PDF</span>
                  </label>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                    className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    {generatingPdf ? 'Generating...' : 'Generate PDF'}
                  </button>
                </div>
              )}
            </section>

            {/* Finish order */}
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Complete Order</h2>
              <p className="text-slate-400 text-sm mb-4">
                This will send the PDF to the customer{order.customerEmail ? ` at ${order.customerEmail}` : ' (no email on file — you\'ll need to call them)'} and mark the order as complete.
              </p>
              <button
                onClick={handleFinishOrder}
                disabled={completing || !pdfGenerated}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                {completing ? 'Completing...' : 'Finish Order & Email Customer'}
              </button>
              {!pdfGenerated && (
                <p className="text-primary/70 text-xs mt-2">Generate the PDF first before finishing the order.</p>
              )}
            </section>
          </>
        )}

        {/* Completed: show PDF download */}
        {isCompleted && order.pdfS3Key && (
          <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">PDF Conclusion Statement</h2>
            <a
              href={`/api/portal/orders/${order.id}/pdf`}
              target="_blank"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg text-sm transition-all"
            >
              Download / View PDF
            </a>
          </section>
        )}

        {/* Completed: show notes (read-only) */}
        {isCompleted && (notes.tvRetailPrice || notes.repairPricePrediction || notes.identifiedProblems || notes.adminNotes) && (
          <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">TV Retail Price</p>
                  <p className="text-slate-300">{notes.tvRetailPrice || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Repair Price Prediction</p>
                  <p className="text-slate-300">{notes.repairPricePrediction || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600">Identified Problems</p>
                <p className="text-slate-300 whitespace-pre-wrap">{notes.identifiedProblems || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Freeform Notes</p>
                <p className="text-slate-300 whitespace-pre-wrap">{notes.adminNotes || '—'}</p>
              </div>
            </div>
          </section>
        )}

        {/* Messages */}
        {msg && <p className="text-emerald-400 text-sm font-medium text-center">{msg}</p>}
        {error && <p className="text-rose-400 text-sm font-medium text-center">{error}</p>}
      </main>

      {/* Preset confirmation modal */}
      {confirmPreset && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setConfirmPreset(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl p-6 border border-slate-800 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-200 font-bold mb-2">Replace verdict text?</p>
            <p className="text-slate-400 text-sm mb-6">
              This will clear the current verdict text and replace it with the <span className="text-primary font-bold">{confirmPreset.name}</span> template.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setVerdictText(confirmPreset.text);
                  setConfirmPreset(null);
                }}
                className="flex-1 bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 rounded-xl transition-all"
              >
                Replace
              </button>
              <button
                onClick={() => setConfirmPreset(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion processing overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-40 px-4 transition-opacity duration-300 ${
          showCompleteOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-sm w-full text-center">
          {completing ? (
            <>
              <div className="animate-spin inline-block w-10 h-10 border-3 border-slate-700 border-t-primary rounded-full mb-4" />
              <p className="text-slate-200 font-bold text-lg">Completing order...</p>
              <p className="text-slate-500 text-sm mt-1">Generating PDF and emailing the customer. This takes a few seconds.</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-200 font-bold text-lg">Order completed!</p>
              <p className="text-slate-500 text-sm mt-1">Customer has been emailed. Redirecting...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
