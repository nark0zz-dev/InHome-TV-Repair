import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://inhometvrepair.com'),
  title: 'IN-HOME TV REPAIR Service | TV Repair Charlotte NC | Same Day Service',
  description: 'Professional in-home TV repair and installation services in Charlotte, NC. We come to you! No need to unplug or move your TV. Fix all brands - power issues, connectivity, smart TV setup, wall mounting. Same-day service available.',
  authors: [{ name: 'IN-HOME TV REPAIR Service' }],
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IN-HOME TV REPAIR Service | TV Repair Charlotte NC | Same Day Service',
    description: 'Expert in-home TV repair and installation services in Charlotte, NC. We come directly to you! All brands serviced. Same-day appointments available. Licensed & insured technicians.',
    type: 'website',
    locale: 'en_US',
    url: 'https://inhometvrepair.com',
    siteName: 'IN-HOME TV REPAIR Service',
    images: [
      {
        url: '/services/tv-repair.png', // Ensure this image exists or use a valid one
        width: 1200,
        height: 630,
        alt: 'In-Home TV Repair Technician in Charlotte',
      },
    ],
  },
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { rel: 'shortcut icon', url: '/favicon.png', type: 'image/png' },
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  // Local Business Schema
  other: {
    'geo.region': 'US-NC',
    'geo.placename': 'Charlotte',
    'geo.position': '35.2271;-80.8431',
    'ICBM': '35.2271, -80.8431',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Local Business Schema for Google Business */}
        <Script id="local-business-schema" type="application/ld+json" strategy="afterInteractive">
          {`
          {
            "@context": "https://schema.org",
            "@type": "ServiceBusiness",
            "name": "IN-HOME TV REPAIR Service",
            "image": "https://inhometvrepair.com/services/tv-repair.png",
            "@id": "https://inhometvrepair.com#localbusiness",
            "url": "https://inhometvrepair.com",
            "telephone": "+19809870005",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Charlotte",
              "addressRegion": "NC",
              "postalCode": "28277",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 35.2271,
              "longitude": -80.8431
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "08:00",
                "closes": "21:00"
              }
            ],
            "areaServed": [
              {
                "@type": "City",
                "name": "Charlotte, NC",
                "@id": "https://www.wikidata.org/wiki/Q16565"
              },
              {
                "@type": "City",
                "name": "Monroe, NC"
              },
              {
                "@type": "City",
                "name": "Concord, NC"
              },
              {
                "@type": "City",
                "name": "Gastonia, NC"
              },
              {
                "@type": "City",
                "name": "Matthews, NC"
              },
              {
                "@type": "City",
                "name": "Mt Holly, NC"
              },
              {
                "@type": "City",
                "name": "Fort Mill, SC"
              },
              {
                "@type": "City",
                "name": "Mint Hill, NC"
              },
              {
                "@type": "City",
                "name": "Pineville, NC"
              },
              {
                "@type": "City",
                "name": "Rock Hill, SC"
              },
              {
                "@type": "City",
                "name": "Stallings, NC"
              },
              {
                "@type": "City",
                "name": "Weddington, NC"
              },
              {
                "@type": "City",
                "name": "Indian Trail, NC"
              },
              {
                "@type": "City",
                "name": "Waxhaw, NC"
              },
              {
                "@type": "City",
                "name": "Wesley Chapel, NC"
              },
              {
                "@type": "City",
                "name": "Tega Cay, SC"
              },
              {
                "@type": "City",
                "name": "Mineral Springs, NC"
              },
              {
                "@type": "City",
                "name": "Indian Land, SC"
              },
              {
                "@type": "City",
                "name": "Huntersville, NC"
              },
              {
                "@type": "City",
                "name": "Lake Norman, NC"
              }
            ],
            "serviceType": "TV Repair",
            "description": "Top-rated in-home TV repair service in Charlotte, NC. We are the 'TV repair near me' experts who come to your house. Fix power issues, black screens, and smart TV setups for Samsung, LG, Sony, Vizio, and more. Call for a TV repair visit today.",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "TV Repair Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "TV Power Issue Repair",
                    "description": "Diagnosis and repair of power cycling or no-power issues"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Main Board Replacement",
                    "description": "Expert replacement of faulty internal components"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Smart TV Setup",
                    "description": "Smart TV configuration and connectivity setup"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "HDMI Repair",
                    "description": "HDMI port and connection repair"
                  }
                }
              ]
            }
          }
          `}
        </Script>

        {/* WebSite Schema for Site Name in Search - Primary Entity */}
        <Script id="website-schema" type="application/ld+json" strategy="beforeInteractive">
          {`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://inhometvrepair.com#website",
            "name": "IN-HOME TV REPAIR Service",
            "alternateName": "inHome TV Repair",
            "url": "https://inhometvrepair.com",
            "description": "Professional in-home TV repair and installation services in Charlotte, NC. We come to you for all TV repair needs.",
            "publisher": {
              "@id": "https://inhometvrepair.com#localbusiness"
            }
          }
          `}
        </Script>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF5722" />
      </head>
      <body className="antialiased bg-white">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
