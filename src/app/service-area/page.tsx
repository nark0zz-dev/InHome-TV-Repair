'use client';

import { motion } from 'framer-motion';
import { HomeIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import OnlineDiagnosticCallout from '@/components/OnlineDiagnosticCallout';

const areas = [
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
];

export default function ServiceAreaPage() {
  const ncAreas = areas.filter(area => area.includes('NC'));
  const scAreas = areas.filter(area => area.includes('SC'));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-16 md:py-24">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Our <span className="text-primary">Service Area</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              We serve the entire Charlotte metropolitan area, from North Carolina to South Carolina. With 20+ communities in our coverage area, we're likely already in your neighborhood.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage Info */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">20+</div>
              <div className="text-slate-600 font-medium">Areas Served</div>
              <p className="text-sm text-slate-500 mt-2">Across NC & SC</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">30 Min</div>
              <div className="text-slate-600 font-medium">Avg. Response</div>
              <p className="text-sm text-slate-500 mt-2">In Charlotte area</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
              <div className="text-4xl font-black text-primary mb-2">No Extra</div>
              <div className="text-slate-600 font-medium">Travel Fees</div>
              <p className="text-sm text-slate-500 mt-2">Within service area</p>
            </div>
          </div>
        </div>
      </section>

      {/* North Carolina Areas */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">North Carolina</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              NC Service Locations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Serving Charlotte and surrounding North Carolina communities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {ncAreas.map((area, index) => (
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

      {/* South Carolina Areas */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">South Carolina</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              SC Service Locations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Also serving South Carolina communities near the border.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {scAreas.map((area, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                className="flex items-center space-x-3 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group min-w-[200px]"
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

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Why We're the Best Choice
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Local expertise with professional service standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <ClockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Local Knowledge</h3>
              <p className="text-sm text-slate-500">We know the area well.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Quick Response</h3>
              <p className="text-sm text-slate-500">Fast local dispatch.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Travel Fees</h3>
              <p className="text-sm text-slate-500">Included in service.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-slate-100">
              <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Same-Day Service</h3>
              <p className="text-sm text-slate-500">When you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* $25 Online Diagnostic Callout */}
      <OnlineDiagnosticCallout />

      {/* Contact CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="Service Area Inquiry"
            heading="Check If We Serve Your Area"
            subheading="Don't see your location? Contact us - we may still be able to help!"
            showInfoPanel={false}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}