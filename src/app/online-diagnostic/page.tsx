'use client';

import { motion } from 'framer-motion';
import {
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiagnosticForm from '@/components/DiagnosticForm';

export default function OnlineDiagnosticPage() {
  const benefits = [
    {
      icon: ClockIcon,
      title: 'Verdict in 2 Hours',
      text: 'Send your photos/video — get an expert assessment back fast, no waiting around.',
    },
    {
      icon: CurrencyDollarIcon,
      title: '$25 - Credited to Repair',
      text: 'A fraction of a $95+ house call. If you book us, the full $25 goes toward your bill.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Honest Verdict',
      text: 'Get a straight answer from a qualified technician before you spend money on parts or a service visit.',
    },
    {
      icon: BoltIcon,
      title: 'No House Call Needed',
      text: 'Skip the scheduling and the trip charge. Get your answer from the comfort of home.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white pt-16 md:pt-24 pb-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white border border-orange-100 rounded-full py-2 px-4 mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-semibold text-slate-600">Online Diagnostic &middot; Only $25</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Instant <span className="text-primary">$25 Online</span><br />
              TV Diagnostic
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Get a diagnostic conclusion from a qualified specialist without leaving home.
              Our technicians have years of experience repairing, servicing, and diagnosing
              issues across all TV brands. Send us a photo or short video and get an expert
              verdict within 2 hours.
            </p>
          </div>
        </div>
      </section>

      {/* How it works + Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-5xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload & Describe', text: 'Send photos or a short video of your TV issue and tell us what\'s happening.' },
              { step: '2', title: 'Pay $25', text: 'Secure payment through Stripe. Your fee is credited toward a full repair if you book us.' },
              { step: '3', title: 'Get Your Verdict', text: 'Within 2 hours you\'ll get an expert verdict by email: repairable, or save your money.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg shadow-orange-200">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-20 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <DiagnosticForm />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center"
              >
                <div className="bg-secondary/50 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 text-primary">
                  <b.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
