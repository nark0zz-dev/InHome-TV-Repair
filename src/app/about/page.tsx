'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon, ShieldCheckIcon, ClockIcon, HomeIcon, WrenchScrewdriverIcon, StarIcon } from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceAreas from '@/components/ServiceAreas';
import ContactForm from '@/components/ContactForm';

export default function AboutPage() {
  const benefits = [
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: 'Same-Day Service',
      description: 'We value your time. Fast scheduling and efficient repairs mean you\'re back to watching TV sooner.',
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: '90-Day Warranty',
      description: 'Every repair comes with our comprehensive 90-day warranty on parts and labor for your peace of mind.',
    },
    {
      icon: <HomeIcon className="w-8 h-8" />,
      title: 'We Come To You',
      description: 'No need to unplug and haul your TV. We bring professional-grade tools directly to your living room.',
    },
    {
      icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
      title: 'Expert Technicians',
      description: 'Highly trained, background-checked professionals with years of TV repair experience.',
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      title: '5-Star Rated',
      description: 'Proudly serving Charlotte with hundreds of 5-star reviews from satisfied customers.',
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees. Get a clear quote before any work begins, with no surprises.',
    },
  ];

  const brands = [
    'Samsung', 'LG', 'Sony', 'Vizio', 'TCL', 'Hisense', 'Philips', 'Sharp', 'Toshiba', 'Insignia'
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-white to-white py-16 md:py-24">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                About <span className="text-primary">inHome TV Repair</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                Professional in-home TV repair and installation services serving Charlotte, NC and surrounding areas since 2018. We're committed to providing fast, reliable service at prices that make sense.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                Trusted by Thousands of Charlotte Residents
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  We started inHome TV Repair with a simple mission: make TV repair convenient and affordable for everyone. We noticed that most people were either paying too much for repairs or buying new TVs when a simple fix would have worked.
                </p>
                <p>
                  By bringing the repair shop to your home, we eliminate the hassle of unplugging, packing, and transporting your TV. Our technicians arrive equipped with professional-grade tools and quality parts to complete repairs on-site, often within an hour.
                </p>
                <p>
                  Today, we're proud to be Charlotte's top-rated in-home TV repair service, with hundreds of 5-star reviews and thousands of happy customers across North and South Carolina.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                <div className="text-4xl font-black text-primary mb-2">5+</div>
                <div className="text-slate-600 font-medium">Years Experience</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                <div className="text-4xl font-black text-primary mb-2">2,500+</div>
                <div className="text-slate-600 font-medium">TVs Repaired</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                <div className="text-4xl font-black text-primary mb-2">95%</div>
                <div className="text-slate-600 font-medium">First-Time Fix Rate</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                <div className="text-4xl font-black text-primary mb-2">5★</div>
                <div className="text-slate-600 font-medium">Google Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              The inHome Difference
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              What sets us apart from other TV repair services in Charlotte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100"
              >
                <div className="bg-secondary/50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">{benefit.title}</h3>
                <p className="text-slate-600 text-center">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands We Service */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              All Major Brands Serviced
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We repair all TV brands and models, from budget sets to premium OLED displays.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <div
                key={brand}
                className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <ServiceAreas />

      {/* Contact CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-orange-50 to-white">
        <div className="w-full px-4 max-w-4xl mx-auto sm:px-6">
          <ContactForm 
            serviceType="General Inquiry"
            heading="Have Questions? Contact Us"
            subheading="We're happy to answer any questions about our services or provide a free quote."
            showInfoPanel={false}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}