'use client';

import { PhoneIcon, ClockIcon, BoltIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import ServiceAreas from '@/components/ServiceAreas';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white pt-16 md:pt-24">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Get In <span className="text-primary">Touch</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Ready to get your TV fixed? Fill out the form below or call us directly for immediate assistance. We typically respond within 30 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="General Contact Form Submission"
            heading="Request a Free Quote"
            subheading="Fill out the form below and we'll call you back within 30 minutes to discuss your TV repair needs."
          />
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Call Us Direct</h3>
              <a href="tel:+19809870005" className="text-2xl font-black text-primary hover:text-primary-dark transition-colors">
                (980) 987-0005
              </a>
              <p className="text-sm text-slate-500 mt-2">Available Mon-Sat, 8am-9pm</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Response Time</h3>
              <div className="text-2xl font-black text-primary mb-2">Within 30 Minutes</div>
              <p className="text-sm text-slate-500">We call you back promptly</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <BoltIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Emergency Service</h3>
              <div className="text-2xl font-black text-primary mb-2">Available</div>
              <p className="text-sm text-slate-500">For urgent repairs</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Email Us</h3>
              <a href="mailto:slavat0005@gmail.com" className="text-2xl font-black text-primary hover:text-primary-dark transition-colors break-all">
                slavat0005@gmail.com
              </a>
              <p className="text-sm text-slate-500 mt-2">We reply within hours</p>
            </div>
          </div>
        </div>
      </section>


      {/* Business Hours Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Business Hours</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <span className="font-bold text-slate-700">Monday - Friday</span>
                <span className="text-slate-600">8:00 AM - 9:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <span className="font-bold text-slate-700">Saturday</span>
                <span className="text-slate-600">8:00 AM - 9:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <span className="font-bold text-slate-700">Sunday</span>
                <span className="text-slate-600">Closed</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <span className="font-bold text-slate-700">Emergency Service</span>
                <span className="text-primary font-bold">24/7 Available</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-slate-700 text-center">
                <span className="font-bold">Same-day appointments available!</span> Call early in the day for best availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <ServiceAreas />

      <Footer />
    </div>
  );
}