'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_COUNT,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/types/diagnostic';

const ACCEPT = '.png,.jpg,.jpeg,.webp,.mp4,.mov,image/png,image/jpeg,image/webp,video/mp4,video/quicktime';

const EXT_SET = new Set<string>(ALLOWED_EXTENSIONS);

function isAllowedFile(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (EXT_SET.has(ext)) return true;
  const t = file.type.toLowerCase();
  return (
    t === 'image/png' ||
    t === 'image/jpeg' ||
    t === 'image/jpg' ||
    t === 'image/webp' ||
    t === 'video/mp4' ||
    t === 'video/quicktime'
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatPhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

type Phase = 'form' | 'uploading' | 'checkout' | 'error';

export default function DiagnosticForm() {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tvBrand: '',
    tvModel: '',
    issueDescription: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const feeNoteRef = useRef<HTMLParagraphElement>(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  // Auto-scroll so the fee note sits at the top of the viewport when checkout appears.
  useEffect(() => {
    if (phase === 'checkout' && feeNoteRef.current) {
      const rect = feeNoteRef.current.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.top - 16,
        behavior: 'smooth',
      });
    }
  }, [phase]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'customerPhone' ? formatPhoneNumber(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setError('');

    const accepted: File[] = [];
    for (const f of arr) {
      if (!isAllowedFile(f)) {
        setError(`"${f.name}" isn't a supported type. Use PNG, JPG, WebP, MP4, or MOV.`);
        continue;
      }
      accepted.push(f);
    }

    setFiles((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_FILE_COUNT) {
        setError(`Maximum ${MAX_FILE_COUNT} files. Extra files were ignored.`);
        return combined.slice(0, MAX_FILE_COUNT);
      }
      const total = combined.reduce((s, f) => s + f.size, 0);
      if (total > MAX_TOTAL_UPLOAD_BYTES) {
        setError(`Total size exceeds 50 MB. Remove some files.`);
      }
      return combined;
    });
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setError('');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.customerName.trim().length < 2) errs.customerName = 'Enter your full name.';
    if (form.customerPhone.replace(/\D/g, '').length !== 10)
      errs.customerPhone = 'Enter a valid 10-digit US phone.';
    if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      errs.customerEmail = 'Enter a valid email, or leave it blank.';
    if (form.issueDescription.trim().length < 10)
      errs.issueDescription = 'Describe the issue in at least 10 characters.';
    if (files.length === 0) errs.media = 'Upload at least one photo or video.';
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) errs.media = 'Total upload exceeds 50 MB.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setPhase('uploading');

    const fd = new FormData();
    fd.set('customerName', form.customerName.trim());
    fd.set('customerPhone', form.customerPhone.trim());
    fd.set('customerEmail', form.customerEmail.trim());
    fd.set('tvBrand', form.tvBrand.trim());
    fd.set('tvModel', form.tvModel.trim());
    fd.set('issueDescription', form.issueDescription.trim());
    for (const f of files) fd.append('media', f);

    try {
      const res = await fetch('/api/online-diagnostic', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Submission failed. Please try again.');
      }

      // Mount Stripe Embedded Checkout.
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error('Stripe publishable key is not configured.');
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error('Failed to load Stripe.');

      setPhase('checkout');

      const checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret: data.clientSecret,
        onComplete: () => {
          // Payment succeeded — redirect to the success page.
          window.location.href = `/online-diagnostic/success?order_id=${encodeURIComponent(data.orderId)}`;
        },
      });

      // Mount into our container (clear any previous mount first).
      if (checkoutRef.current) {
        checkoutRef.current.innerHTML = '';
        checkout.mount(checkoutRef.current);
      }
    } catch (err) {
      console.error('Diagnostic submit error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please call us.');
      setPhase('error');
    }
  };

  const isLocked = phase === 'uploading' || phase === 'checkout';

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="p-8 md:p-12">
        <div className="text-center md:text-left mb-8">
          <span className="inline-block bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            $25 Online Diagnostic
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            Send us your TV issue
          </h2>
          <p className="text-slate-600">
            Upload a photo or short video of the problem. Pay $25, get an expert verdict within 2 hours.
            The fee is credited toward your repair if you book us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={onInputChange}
                required
                disabled={isLocked}
                autoComplete="name"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60"
                placeholder="John Doe"
              />
              {fieldErrors.customerName && <p className="text-red-600 text-sm mt-1">{fieldErrors.customerName}</p>}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={form.customerPhone}
                onChange={onInputChange}
                required
                disabled={isLocked}
                maxLength={14}
                inputMode="numeric"
                autoComplete="tel"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60"
                placeholder="(XXX) XXX-XXXX"
              />
              {fieldErrors.customerPhone && <p className="text-red-600 text-sm mt-1">{fieldErrors.customerPhone}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Email <span className="text-slate-400 font-normal normal-case">(optional, but recommended for your verdict)</span>
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={form.customerEmail}
              onChange={onInputChange}
              disabled={isLocked}
              autoComplete="email"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60"
              placeholder="you@example.com"
            />
            {fieldErrors.customerEmail && <p className="text-red-600 text-sm mt-1">{fieldErrors.customerEmail}</p>}
            <p className="text-xs text-slate-500 mt-1">If you skip this, we'll ask for it during payment so we can email your verdict.</p>
          </div>

          {/* TV Brand + Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tvBrand" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                TV Brand <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                id="tvBrand"
                name="tvBrand"
                value={form.tvBrand}
                onChange={onInputChange}
                disabled={isLocked}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60"
                placeholder="Samsung, LG, Sony..."
              />
            </div>
            <div>
              <label htmlFor="tvModel" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Model Number <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                id="tvModel"
                name="tvModel"
                value={form.tvModel}
                onChange={onInputChange}
                disabled={isLocked}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60"
                placeholder="Found on the back of the TV"
              />
            </div>
          </div>

          {/* Issue description */}
          <div>
            <label htmlFor="issueDescription" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Describe the Issue
            </label>
            <textarea
              id="issueDescription"
              name="issueDescription"
              value={form.issueDescription}
              onChange={onInputChange}
              required
              disabled={isLocked}
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400 disabled:opacity-60 resize-y"
              placeholder="e.g. TV turns on but the screen is black, sound works. Started happening yesterday after a power outage."
            />
            {fieldErrors.issueDescription && <p className="text-red-600 text-sm mt-1">{fieldErrors.issueDescription}</p>}
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Photos / Video of the Issue
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !isLocked && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
              } ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <CloudArrowUpIcon className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-bold text-slate-700 mb-1">Drag &amp; drop files here, or click to browse</p>
              <p className="text-sm text-slate-500">PNG, JPG, WebP, MP4, MOV &middot; up to 50 MB total &middot; max {MAX_FILE_COUNT} files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={onFileInput}
                className="hidden"
                disabled={isLocked}
              />
            </div>

            {fieldErrors.media && <p className="text-red-600 text-sm mt-2">{fieldErrors.media}</p>}

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 space-y-2"
                >
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {f.type.startsWith('video/') ? (
                          <VideoCameraIcon className="w-6 h-6 text-primary flex-shrink-0" />
                        ) : (
                          <PhotoIcon className="w-6 h-6 text-primary flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{f.name}</p>
                          <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
                        </div>
                      </div>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                          aria-label={`Remove ${f.name}`}
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {files.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Total: {formatBytes(totalBytes)} / 50 MB
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLocked}
            className={`w-full text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-xl transition-all duration-200 shadow-xl ${
              isLocked
                ? 'bg-primary-light cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark hover:-translate-y-1 shadow-orange-200 hover:shadow-orange-300'
            }`}
          >
            {phase === 'uploading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span>Pay $25 &amp; Submit</span>
            )}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <p ref={feeNoteRef} className="text-xs text-slate-500 text-center">
            Your $25 fee is 100% credited toward a full repair if you book us. Secure payment by Stripe.
          </p>
        </form>
      </div>

      {/* Stripe Embedded Checkout mounts here (replaces the form visually). */}
      {phase === 'checkout' && (
        <div ref={checkoutContainerRef} className="border-t border-slate-100 bg-slate-50 p-4 md:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Complete your $25 payment</h3>
          <div ref={checkoutRef} className="min-h-[600px] bg-white rounded-xl" />
        </div>
      )}
    </div>
  );
}
