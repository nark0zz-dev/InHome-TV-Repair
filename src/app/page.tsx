'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  PhoneIcon,
  ClockIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { a } from 'framer-motion/client';

export default function TVRepairLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    let phoneNumber = value.replace(/\D/g, '');

    // Don't allow 1 as first digit (regional code)
    if (phoneNumber.startsWith('1')) {
      phoneNumber = phoneNumber.slice(1);
    }

    // Format as (XXX) XXX-XXXX
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
          service_type: 'In-Home TV Repair & Installation (Visit)'
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

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const reviews = [
    {
      name: 'Sarah Jenkins',
      location: 'South Charlotte',
      text: 'Absolutely amazing service! They came to my house the same day I called. Fixed my LG OLED display issue in under an hour. Highly recommend!',
      rating: 5
    },
    {
      name: 'Mike Thompson',
      location: 'Dilworth',
      text: 'I thought I would have to buy a new TV, but they saved me hundreds of dollars. The technician was polite, professional, and wore shoe covers.',
      rating: 5
    },
    {
      name: 'David Wilson',
      location: 'NoDa',
      text: 'Great experience. Transparent pricing and no hidden fees. My Samsung TV works perfectly now. 10/10 service.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Brand Entity Marker - Above Fold */}
      <div className="sr-only">
        <h1>inHome TV Repair</h1>
        <p>Professional TV repair and installation services serving Charlotte, North Carolina</p>
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-1 flex items-center space-x-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/icon.svg"
                  alt="TV Repair Charlotte NC - In-Home Service Icon"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                  inHome
                </div>
                <div className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-none mt-0.5 uppercase">
                  TV Repair
                </div>
              </div>
            </div>

            <button
              onClick={scrollToContact}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 md:py-3 md:px-8 rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-orange-300 text-base md:text-lg transform hover:-translate-y-0.5"
            >
              Call Me Back
            </button>
          </div>
        </div>

        {/* Benefits Bar */}
        <div className="border-t py-3 bg-secondary border-secondary-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between md:justify-center md:space-x-12 text-center">
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2">
                <CheckCircleIcon className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                <span className="text-xs md:text-sm font-bold text-slate-700">Same-Day Service</span>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2">
                <CheckCircleIcon className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                <span className="text-xs md:text-sm font-bold text-slate-700">All Major Brands</span>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2">
                <CheckCircleIcon className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                <span className="text-xs md:text-sm font-bold text-slate-700">90-Day Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-12 md:py-20 lg:py-24">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-100 opacity-50 blur-3xl pointer-events-none"></div>

        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-white border border-orange-100 rounded-full py-2 px-4 mb-6 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-semibold text-slate-600">Available Today in Charlotte, NC</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                Expert <span className="text-primary">In-Home TV Repair</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">in Charlotte, NC</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Don't haul your TV to a shop. We bring the repair shop to you. Professional diagnostics and repair for Samsung, LG, Sony, Vizio and all major brands, right in your living room.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-orange-200 transform hover:-translate-y-1"
                >
                  <PhoneIcon className="w-6 h-6" />
                  <span>Get Free Quote</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/vJJ5Rv3U1wcApo9N6?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#fff3e0] hover:bg-[#ffe0b2] text-slate-800 font-bold py-4 px-6 rounded-xl transition-all text-lg duration-200 border-[3px] border-[#fc6435] shadow-lg shadow-orange-100 transform hover:-translate-y-1"
                >
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span>5 Star Google Rating</span>
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/services/tv-repair.png"
                  alt="Professional TV Repair Technician in Charlotte NC"
                  width={600}
                  height={450}
                  className="object-cover w-full h-auto"
                  priority
                />

                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-100 max-w-xs">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Licensed & Insured</p>
                      <p className="text-xs text-slate-500">100% Satisfaction Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Image (shown only on small screens) */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl lg:hidden mb-4">
              <Image
                src="/services/tv-repair.png"
                alt="TV Repair Service Charlotte NC"
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">What We Fix</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Common TV Problems
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our certified technicians are equipped to handle a wide range of issues on the spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'TV not turning on / Black screen',
              'No picture, but has sound',
              'No sound, but has picture',
              'HDMI / Port connection failing',
              'Smart TV WiFi/App issues',
              'Remote control unresponsive',
              'Distorted color or lines',
              'TV turning off by itself',
              'Power board overheating'
            ].map((issue, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex items-center space-x-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <CheckCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-slate-700 font-bold text-lg group-hover:text-primary transition-colors">{issue}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Service Area</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              We Come To You
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional in-home TV repair service across Charlotte and surrounding communities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              'Charlotte, NC',
              'Monroe, NC', 
              'Concord, NC',
              'Gastonia, NC',
              'Matthews, NC',
              'Mt Holly, NC',
              'Fort Mill, SC',
              'Mint Hill, NC',
              'Pineville, NC',
              'Rock Hill, SC',
              'Stallings, NC',
              'Weddington, NC',
              'Indian Trail, NC',
              'Waxhaw, NC',
              'Wesley Chapel, NC',
              'Tega Cay, SC',
              'Mineral Springs, NC',
              'Indian Land, SC',
              'Huntersville, NC',
              'Lake Norman, NC'
            ].map((area, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                className="flex items-center space-x-3 bg-white rounded-xl p-5 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="bg-secondary/50 rounded-lg p-2.5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <HomeIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-700 font-semibold text-base group-hover:text-primary transition-colors">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              The In-Home Advantage
            </h2>
            <p className="text-lg text-slate-600">
              Why thousands of Charlotte residents trust us.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Same-Day Service</h3>
              <p className="text-sm text-slate-500">We value your time. Fast, efficient scheduling.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">90-Day Warranty</h3>
              <p className="text-sm text-slate-500">Peace of mind with every repair we perform.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <WrenchScrewdriverIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Techs</h3>
              <p className="text-sm text-slate-500">Highly trained, background-checked professionals.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">We Come to You</h3>
              <p className="text-sm text-slate-500">No heavy lifting. We repair right in your home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Happy Customers
            </h2>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600">Rated 5 Stars by your neighbors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-slate-50 px-8 py-10 rounded-3xl border border-slate-100 relative">
                {/* Quote Icon */}
                <div className="absolute top-6 right-8 text-slate-200">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                  </svg>
                </div>

                <div className="flex space-x-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-sm text-slate-500">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white scroll-mt-20">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="md:flex">
              {/* Info Side */}
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
                    <BoltIcon className="w-5 h-5" />
                    <span className="font-bold">Urgent? Call Now</span>
                  </div>
                  <a href="tel:+19809870005" className="text-2xl font-black mt-1 block">
                    (980) 987-0005
                  </a>
                </div>
              </div>

              {/* Form Side */}
              <div className="p-8 md:p-12 md:w-3/5">
                <div className="text-center md:text-left mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
                    Get Your Free Quote
                  </h2>
                  <p className="text-slate-600">
                    We'll analyze the issue and call you back shortly.
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
                    className={`w-full text-white font-bold text-xl py-5 rounded-xl transition-all duration-200 shadow-xl ${isSubmitting
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
                      className={`p-4 rounded-xl text-sm font-medium ${submitMessage.includes('Thank you')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                      <div className="flex items-start space-x-2">
                        <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${submitMessage.includes('Thank you') ? 'text-green-500' : 'text-red-500'
                          }`} />
                        <span>{submitMessage}</span>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-black mb-6 tracking-tight">TV Repair Charlotte</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Professional In-Home TV Repair & Installation Services. We bring the tools and expertise to your doorstep.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-slate-200 uppercase tracking-wide">Contact</h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-primary" />
                  <span>(980) 987-0005</span>
                </li>
                <li className="flex items-center space-x-3">
                  <HomeIcon className="w-5 h-5 text-primary" />
                  <span>Charlotte, NC & Surroundings</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-slate-200 uppercase tracking-wide">Hours</h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-primary" />
                  <span>Mon-Sat: 8am - 9pm</span>
                </li>
                <li className="flex items-center space-x-3">
                  <BoltIcon className="w-5 h-5 text-primary" />
                  <span>Emergency Svc Available</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} In-Home TV Repair & Installation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}