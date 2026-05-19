import Link from 'next/link';
import { PhoneIcon, HomeIcon, ClockIcon, BoltIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12 md:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-black mb-6 tracking-tight">TV Repair Charlotte</h3>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Professional In-Home TV Repair & Installation Services. We bring the tools and expertise to your doorstep.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-slate-200 uppercase tracking-wide">Contact</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <a href="tel:+19809870005" className="hover:text-white transition-colors">
                  (980) 987-0005
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary" />
                <a href="mailto:slavat0005@gmail.com" className="hover:text-white transition-colors">
                  slavat0005@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <HomeIcon className="w-5 h-5 text-primary" />
                <Link href="/service-area" className="hover:text-white transition-colors">
                  Charlotte, NC & Surroundings
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
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

        {/* Services Links */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              href="/services/tv-power-repair" 
              className="text-slate-400 hover:text-primary transition-colors text-sm"
            >
              TV Power Repair
            </Link>
            <Link 
              href="/services/connection-problems" 
              className="text-slate-400 hover:text-primary transition-colors text-sm"
            >
              Connection Problems
            </Link>
            <Link 
              href="/services/hdmi-connectivity" 
              className="text-slate-400 hover:text-primary transition-colors text-sm"
            >
              HDMI & Connectivity
            </Link>
            <Link 
              href="/services/tv-installation" 
              className="text-slate-400 hover:text-primary transition-colors text-sm"
            >
              TV Installation
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {currentYear} In-Home TV Repair & Installation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}