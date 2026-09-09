'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircleIcon,
  PhoneIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type State = 'loading' | 'paid' | 'unknown';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const orderId = params.get('order_id');
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    // Either a Stripe session_id (return_url redirect) or our order_id
    // (onComplete redirect) indicates a completed checkout.
    if (!sessionId && !orderId) {
      setState('unknown');
      return;
    }
    setState('paid');
  }, [sessionId, orderId]);

  return (
    <section className="py-20 md:py-32">
      <div className="w-full px-4 max-w-2xl mx-auto sm:px-6 text-center">
        {state === 'loading' && (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-600">Confirming your payment...</p>
          </div>
        )}

        {state === 'paid' && (
          <>
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Your diagnostic request is in!
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We received your <strong>$25 Online TV Diagnostic</strong> request and payment.
              Our technician is reviewing your photos/video now
              and you'll have your expert verdict <strong>within 2 hours</strong>.
            </p>

            {orderId && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 text-center">
                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2">
                  Your Order Number
                </p>
                <p className="text-3xl md:text-4xl font-black tracking-wider mb-3">
                  #{orderId.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-slate-300">
                  Save or screenshot this number — you'll need it if you contact us about your diagnostic.
                </p>
              </div>
            )}

            <div className="bg-secondary rounded-2xl p-6 border border-secondary-dark text-left mb-8">
              <p className="font-bold text-slate-800 mb-2">What happens next?</p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>You'll get a confirmation email shortly with your order number.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Our expert reviews your media and reaches a verdict within 2 hours.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Your verdict arrives by email. If repairable, your $25 is credited toward the repair.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <a
                href="tel:+19809870005"
                className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-200"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>Call (980) 987-0005</span>
              </a>
            </div>
          </>
        )}

        {state === 'unknown' && (
          <>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Payment received</h1>
            <p className="text-lg text-slate-600 mb-8">
              Thanks! If you completed payment, your diagnostic request is being processed
              and you'll receive a confirmation email shortly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function DiagnosticSuccessPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <Suspense fallback={
        <section className="py-20 md:py-32">
          <div className="w-full px-4 max-w-2xl mx-auto sm:px-6 text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-600">Loading...</p>
          </div>
        </section>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
