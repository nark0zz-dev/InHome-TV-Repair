'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BoltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

export default function OnlineDiagnosticCallout() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      <div className="w-full px-4 max-w-6xl mx-auto sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        >
          {/* Left: copy */}
          <div className="text-white">
            <div className="inline-flex items-center space-x-2 bg-primary/20 border border-primary/30 rounded-full py-2 px-4 mb-6">
              <BoltIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary-light uppercase tracking-wider">New &middot; Only $25</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              Not sure if your TV is worth fixing?
              <span className="block text-primary mt-2">Get an online verdict for $25.</span>
            </h2>

            <p className="text-lg text-stone-200 mb-8 leading-relaxed">
              Don&apos;t pay $95+ for a house call just to find out your screen is dead.
              Send us a photo or short video of the issue and get an expert verdict within 2 hours &mdash;
              from the comfort of home.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/20 rounded-full p-2 flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-primary-light" />
                </div>
                <p className="text-stone-100 font-semibold">Expert verdict within 2 hours</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/20 rounded-full p-2 flex-shrink-0">
                  <CurrencyDollarIcon className="w-5 h-5 text-primary-light" />
                </div>
                <p className="text-stone-100 font-semibold">$25 fee is 100% credited toward your repair</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/20 rounded-full p-2 flex-shrink-0">
                  <BoltIcon className="w-5 h-5 text-primary-light" />
                </div>
                <p className="text-stone-100 font-semibold">Honest answer before you waste money on parts</p>
              </div>
            </div>

            <Link
              href="/online-diagnostic"
              className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-orange-900/40 transform hover:-translate-y-1"
            >
              <span>Start Your $25 Diagnostic</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Right: price comparison card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Compare your options</h3>

            <div className="space-y-4">
              {/* Online diagnostic */}
              <div className="border-2 border-primary rounded-2xl p-5 bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Recommended
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-slate-800">Online Diagnostic</span>
                  <span className="text-2xl font-black text-primary">$25</span>
                </div>
                <p className="text-sm text-slate-600">Send photos/video &middot; verdict in 2 hours &middot; fee credited to repair</p>
              </div>

              {/* In-home visit */}
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-slate-800">In-Home Visit</span>
                  <span className="text-2xl font-black text-slate-500">$95+</span>
                </div>
                <p className="text-sm text-slate-600">Technician comes to you &middot; same-day &middot; full diagnosis on site</p>
              </div>
            </div>

            <Link
              href="/online-diagnostic"
              className="mt-6 w-full inline-flex items-center justify-center space-x-2 bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              <span>Try the $25 option</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
