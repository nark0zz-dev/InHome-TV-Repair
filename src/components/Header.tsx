'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { CheckCircleIcon, Bars3Icon, XMarkIcon, BoltIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const services = [
    { name: 'TV Power Repair', href: '/services/tv-power-repair', description: 'Fix power issues & black screens' },
    { name: 'Connection Problems', href: '/services/connection-problems', description: 'WiFi & Bluetooth issues' },
    { name: 'HDMI & Connectivity', href: '/services/hdmi-connectivity', description: 'Port repair & connections' },
    { name: 'TV Installation', href: '/services/tv-installation', description: 'Wall mounting & setup' },
  ];

  const navLinks: Array<{ name: string; href?: string; hasDropdown?: boolean; highlight?: boolean }> = [
    { name: 'Home', href: '/' },
    { name: 'Services', hasDropdown: true },
    { name: 'Service Area', href: '/service-area' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Online Diagnostic', href: '/online-diagnostic', highlight: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-1 flex items-center space-x-3 hover:opacity-90 transition-opacity">
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
                <span className="sr-only">inHome TV Repair</span>
                <span aria-hidden="true">inHome</span>
                <span aria-hidden="true" className="block text-sm md:text-base font-black text-slate-800 tracking-tight leading-none mt-0.5 uppercase">TV Repair</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.name}
                  ref={dropdownRef}
                  className="relative"
                >
                  <button
                    onClick={toggleDropdown}
                    className={`font-bold py-2 px-3 rounded-lg transition-colors ${
                      pathname.startsWith('/services')
                        ? 'text-primary bg-primary/10'
                        : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                    } ${isServicesDropdownOpen ? 'text-primary bg-slate-50' : ''}`}
                  >
                    {link.name}
                  </button>

                  {/* Dropdown Menu */}
                  {isServicesDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${
                            isActive(service.href) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="font-bold text-slate-800 mb-1">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center space-x-1.5 ${
                    isActive(link.href!)
                      ? 'text-primary bg-primary/10'
                      : link.highlight
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.highlight && <BoltIcon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </Link>
              )
            )}

            <Link
              href="/contact"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-orange-300 text-base transform hover:-translate-y-0.5"
            >
              Call Me Back
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.name}>
                  <div className="font-bold text-slate-800 py-2 px-3 mb-2">{link.name}</div>
                  <div className="pl-4 space-y-2">
                    {services.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          isActive(service.href)
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`flex items-center space-x-2 py-2 px-3 rounded-lg font-bold transition-colors ${
                    isActive(link.href!)
                      ? 'bg-primary/10 text-primary'
                      : link.highlight
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  {link.highlight && <BoltIcon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </Link>
              )
            )}

            <Link
              href="/contact"
              className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 mt-4"
            >
              Call Me Back
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}