import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for TV Repair landing page
 * Optimized for search engine crawling
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/portal'],
      },
    ],
    sitemap: 'https://inhometvrepair.com/sitemap.xml',
  };
}