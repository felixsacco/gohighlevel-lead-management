"use client";

import React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Shield,
  Clock,
  Star,
  HelpCircle,
  CheckCircle,
  Info,
  Zap,
  Users,
  Award,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
  category: 'verification' | 'pricing' | 'insurance' | 'booking' | 'general';
  relatedLink?: {
    text: string;
    href: string;
  };
}

const FAQSection = () => {
  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      question: 'How do I know a tradesperson is approved and trustworthy?',
      answer: 'Every tradesperson on our platform undergoes a rigorous verification process including identity checks, qualification verification, insurance validation, and background screening. We also continuously monitor reviews and performance to ensure quality standards are maintained.',
      icon: Shield,
      category: 'verification',
      relatedLink: {
        text: 'Learn about our verification process',
        href: '/blog/how-we-verify-tradespeople'
      }
    },
    {
      id: 'faq-2',
      question: 'Can I get instant quotes in my area?',
      answer: 'Yes! Our AI-powered quote system provides instant estimates based on your job description, location, and current market rates. You can get preliminary quotes in under 60 seconds, and detailed quotes from matched tradespeople within minutes.',
      icon: Zap,
      category: 'pricing',
      relatedLink: {
        text: 'How instant quotes work',
        href: '/blog/instant-quotes-near-you'
      }
    },
    {
      id: 'faq-3',
      question: 'Are all tradespeople fully insured?',
      answer: 'Absolutely. We require all tradespeople to have valid public liability insurance (minimum £2M coverage) and employers liability insurance where applicable. We verify and monitor insurance status regularly to ensure continuous protection for your projects.',
      icon: CheckCircle,
      category: 'insurance',
      relatedLink: {
        text: 'Why insurance matters',
        href: '/blog/insured-tradespeople'
      }
    },
    {
      id: 'faq-4',
      question: 'How quickly can I book a tradesperson?',
      answer: 'Most tradespeople respond within 3-15 minutes during business hours. For urgent jobs, we have emergency services available 24/7. Same-day bookings are often possible, and you can typically schedule work within 24-48 hours for non-emergency jobs.',
      icon: Clock,
      category: 'booking',
      relatedLink: {
        text: 'Tips for faster booking',
        href: '/blog/book-a-tradesperson-fast'
      }
    },
    {
      id: 'faq-5',
      question: 'What if I\'m not satisfied with the work completed?',
      answer: 'We offer a comprehensive satisfaction guarantee. If you\'re not happy with the work, we\'ll work with the tradesperson to resolve issues. For serious problems, our insurance coverage and dispute resolution process ensure you\'re protected.',
      icon: Star,
      category: 'general',
      relatedLink: {
        text: 'Our guarantee policy',
        href: '/guarantee'
      }
    },
    {
      id: 'faq-6',
      question: 'How much does it cost to use MyApproved?',
      answer: 'For customers, using MyApproved is completely free. You pay only the tradesperson for their work. There are no hidden fees, booking charges, or membership costs. Tradespeople pay a small service fee only when they successfully complete jobs.',
      icon: Info,
      category: 'pricing',
      relatedLink: {
        text: 'Pricing transparency',
        href: '/pricing'
      }
    },
    {
      id: 'faq-7',
      question: 'Can I see reviews and ratings before booking?',
      answer: 'Yes! Every tradesperson has a detailed profile showing verified customer reviews, star ratings, completed projects, and response times. All reviews are from real customers who have used our platform, ensuring authenticity.',
      icon: Users,
      category: 'verification',
      relatedLink: {
        text: 'How we verify reviews',
        href: '/blog/verified-reviews'
      }
    },
    {
      id: 'faq-8',
      question: 'What areas do you cover across the UK?',
      answer: 'We cover all major cities and towns across England, Scotland, Wales, and Northern Ireland. Our network includes over 10,000 verified tradespeople in locations from London to Edinburgh, Manchester to Cardiff, and everywhere in between.',
      icon: Award,
      category: 'general',
      relatedLink: {
        text: 'Check coverage in your area',
        href: '/coverage'
      }
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'verification':
        return 'text-green-600';
      case 'pricing':
        return 'text-[#FDBD18]';
      case 'insurance':
        return 'text-blue-600';
      case 'booking':
        return 'text-purple-600';
      case 'general':
        return 'text-[#0056D2]';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'verification':
        return 'bg-green-50 border-green-200';
      case 'pricing':
        return 'bg-yellow-50 border-yellow-200';
      case 'insurance':
        return 'bg-blue-50 border-blue-200';
      case 'booking':
        return 'bg-purple-50 border-purple-200';
      case 'general':
        return 'bg-[#0056D2]/5 border-[#0056D2]/20';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FDBD18]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#0056D2]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#0056D2]/10 text-[#0056D2] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0056D2] mb-4">
            Got <span className="text-[#FDBD18]">Questions?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to the most common questions about our platform, verification process, and how to get the best results.
          </p>
        </div>

        {/* Enhanced FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => {
              const IconComponent = faq.icon;
              
              return (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-6 hover:no-underline group-hover:bg-gray-50/50 transition-colors duration-300">
                    <div className="flex items-start gap-4 text-left w-full">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getCategoryBg(faq.category)} flex items-center justify-center border`}>
                        <IconComponent className={`w-5 h-5 ${getCategoryColor(faq.category)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#0056D2] group-hover:text-[#FDBD18] transition-colors duration-300 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="ml-14 space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                      
                      {faq.relatedLink && (
                        <div className="pt-2">
                          <Link 
                            href={faq.relatedLink.href}
                            className={`inline-flex items-center gap-2 text-sm font-semibold ${getCategoryColor(faq.category)} hover:underline transition-colors duration-300`}
                          >
                            <span>{faq.relatedLink.text}</span>
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Still have questions section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#0056D2]/5 via-white to-[#FDBD18]/5 rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[#0056D2] mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our customer support team is here to help. Get in touch and we'll respond within 2 hours during business hours.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0056D2] to-blue-700 hover:from-blue-700 hover:to-[#0056D2] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>Contact Support</span>
                <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
              </Link>
              
              <Link
                href="/help"
                className="inline-flex items-center px-6 py-3 rounded-2xl bg-white border-2 border-[#0056D2]/20 text-[#0056D2] font-bold hover:bg-[#0056D2]/5 hover:border-[#0056D2]/40 transition-all duration-300"
              >
                <span>Help Center</span>
                <HelpCircle className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map(faq => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer + (faq.relatedLink ? ` Learn more: ${faq.relatedLink.href}` : '')
                }
              }))
            })
          }}
        />
      </div>
    </section>
  );
};

export default FAQSection;
