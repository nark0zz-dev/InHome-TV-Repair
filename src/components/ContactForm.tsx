'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface ContactFormProps {
  serviceType?: string;
  heading?: string;
  subheading?: string;
  showInfoPanel?: boolean;
}

export default function ContactForm({
  serviceType = 'In-Home TV Repair & Installation (Visit)',
  heading = 'Get Your Free Quote',
  subheading = "We'll analyze the issue and call you back shortly.",
  showInfoPanel = true,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const formatPhoneNumber = (value: string) => {
    let phoneNumber = value.replace(/\D/g, '');

    if (phoneNumber.startsWith('1')) {
      phoneNumber = phoneNumber.slice(1);
    }

    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setPhoneError('Please enter a complete 10-digit phone number.');
      return;
    }
    setPhoneError('');

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/tv-repair-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          service_type: serviceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitMessage('Thank you! We will call you back within 30 minutes to schedule your TV repair visit.');
      setFormData({ name: '', phone: '' });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('There was an error submitting your request. Please call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="md:flex">
        {/* Info Side */}
        {showInfoPanel && (
          <div className="hidden md:block md:w-2/5 bg-slate-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold mb-6 relative z-10">Fast Info</h3>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Response Time</p>
                <p className="font-semibold text-lg">Within 30 Mins</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Service Area</p>
                <p className="font-semibold text-lg">Greater Charlotte</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Warranty</p>
                <p className="font-semibold text-lg">90 Days</p>
              </div>
            </div>
            <div className="mt-12 relative z-10">
              <div className="inline-flex items-center space-x-2 text-primary-light">
                <PhoneIcon className="w-5 h-5" />
                <span className="font-bold">Urgent? Call Now</span>
              </div>
              <a href="tel:+19809870005" className="text-2xl font-black mt-1 block">
                (980) 987-0005
              </a>
              <a href="mailto:slavat0005@gmail.com" className="text-sm mt-2 block hover:text-primary transition-colors">
                slavat0005@gmail.com
              </a>
            </div>
          </div>
        )}

        {/* Form Side */}
        <div className={`p-8 md:p-12 ${showInfoPanel ? 'md:w-3/5' : 'w-full'}`}>
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
              {heading}
            </h2>
            <p className="text-slate-600">
              {subheading}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400"
                placeholder="John Doe"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                maxLength={14}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-900 placeholder-slate-400"
                placeholder="(XXX) XXX-XXXX"
                disabled={isSubmitting}
                autoComplete="tel"
                inputMode="numeric"
              />
              {phoneError && (
                <p className="text-red-600 text-sm font-medium mt-2">{phoneError}</p>
              )}
            </div>

            {/* Screen Repair Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 rounded-full p-1 flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Screen Damage Notice</p>
                  <p className="text-xs text-amber-700">We usually don't repair cracked screens because repair costs often exceed the price of a new TV.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold text-xl py-5 rounded-xl transition-all duration-200 shadow-xl ${
                isSubmitting
                  ? 'bg-primary-light cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark hover:-translate-y-1 shadow-orange-200 hover:shadow-orange-300'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <PhoneIcon className="w-6 h-6" />
                  <span>Call Me Back</span>
                </span>
              )}
            </button>

            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm font-medium ${
                  submitMessage.includes('Thank you')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${
                    submitMessage.includes('Thank you') ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span>{submitMessage}</span>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}