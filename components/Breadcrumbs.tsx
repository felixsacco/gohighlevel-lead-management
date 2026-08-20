"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { SchemaMarkup } from './SchemaMarkup';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', href: '/' }];

    // Page name mappings
    const pageNames: Record<string, string> = {
      'instant-quote': 'Instant Quote',
      'post-job': 'Post a Job',
      'find-tradespeople': 'Find Tradespeople',
      'about': 'About Us',
      'contact': 'Contact',
      'faq': 'FAQ',
      'register': 'Register',
      'client': 'Client',
      'tradesperson': 'Tradesperson Profile',
      'login': 'Login',
      'privacy': 'Privacy Policy',
      'terms': 'Terms & Conditions',
      'cookies': 'Cookie Policy'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Special handling for tradesperson profile pages
      if (segment === 'tradesperson' && pathSegments[index + 1]) {
        // This is a tradesperson profile page, show "Tradesperson Profile" instead of the ID
        const name = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ name, href: currentPath });
      } else if (pathSegments[index - 1] === 'tradesperson' && segment.length > 20) {
        // This is likely a tradesperson ID, skip it or show a generic name
        return; // Skip adding this segment to breadcrumbs
      } else {
        const name = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://myapproved.com${item.href}`
    }))
  };

  // Don't show breadcrumbs on home page
  if (pathname === '/' || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <>
      <SchemaMarkup schema={breadcrumbSchema} />
      <nav className={`bg-white border-b-2 border-blue-100 shadow-sm ${className}`} aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 py-4 text-sm font-medium">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-blue-400 mx-2" />
                )}
                
                {index === 0 ? (
                  <Link
                    href={item.href}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1 rounded-xl"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    <span>{item.name}</span>
                  </Link>
                ) : index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-xl" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
