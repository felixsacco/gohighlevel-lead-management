import { generateMetadata } from '@/lib/seo';
import { HelpCircle, ChevronDown, Search, Shield, Users, CreditCard } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import SectionHeaderPill from '@/components/ui/SectionHeaderPill';
import { graphify } from '@/components/SchemaMarkup';

export const metadata = generateMetadata('faq', {
  title: 'FAQ - Frequently Asked Questions About Hiring Tradespeople | MyApproved',
  description: 'Answers to the most common questions about finding verified tradespeople in the UK - how verification works, pricing, insurance, and more. Free to use for homeowners.',
  keywords: ['FAQ tradespeople UK', 'frequently asked questions', 'how does MyApproved work', 'tradesperson verification', 'free quotes UK'],
  canonical: 'https://myapproved.com/faq'
});

const faqSchema = graphify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://myapproved.com/#organization",
    "name": "MyApproved",
    "url": "https://myapproved.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://myapproved.com/faq",
    "url": "https://myapproved.com/faq",
    "mainEntity": [
    {
      "@type": "Question",
      "name": "How does MyApproved work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Post your job and verified tradespeople matched to your trade and location call you back with quotes. Compare their profiles, then hire the right person — free for homeowners."
      }
    },
    {
      "@type": "Question",
      "name": "Is MyApproved free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Posting jobs and viewing quotes is free for homeowners. Tradespeople pay £4.99 a lead, pay as you go."
      }
    },
    {
      "@type": "Question",
      "name": "How are tradespeople verified on MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Identity, business and insurance checks. Photo ID verified against a live selfie, a business registered on Companies House, and public liability insurance confirmed in date and monitored so the listing is withdrawn if it lapses."
      }
    },
    {
      "@type": "Question",
      "name": "Are all tradespeople on MyApproved insured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every listed tradesperson must hold public liability insurance, confirmed in date and monitored throughout — the listing is withdrawn if cover lapses."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to hire a tradesperson through MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Costs vary by trade and job. Post your job and get no-obligation quotes from matched tradespeople who call you back to compare."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly can I find a tradesperson near me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Post your job and you'll receive a brief matched by trade and location. Verified tradespeople call you back; response times vary by trade and area."
      }
    },
    {
      "@type": "Question",
      "name": "What if I'm not satisfied with the work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Talk to the tradesperson first. If it isn't resolved, contact support@myapproved.com and we'll help work toward a resolution."
      }
    }
  ]
  },
]);

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Users,
      questions: [
        {
          question: 'How does MyApproved work?',
          answer: 'Post your job and verified tradespeople matched to your trade and location call you back with quotes. Compare profiles, then hire whoever fits.'
        },
        {
          question: 'Is MyApproved free to use?',
          answer: 'Yes, free for homeowners — to post jobs and view quotes. Tradespeople pay £4.99 a lead, pay as you go.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" and choose homeowner or tradesperson, fill in your details, and verify your email.'
        }
      ]
    },
    {
      title: 'Finding Tradespeople',
      icon: Search,
      questions: [
        {
          question: 'How are tradespeople verified?',
          answer: 'Every tradesperson passes identity, business and insurance checks before they can appear: photo ID verified against a live selfie, a business registered on Companies House, and public liability insurance confirmed genuine and in date. Insurance stays monitored so the listing is withdrawn if it lapses.'
        },
        {
          question: 'How many quotes will I receive?',
          answer: 'It depends. Verified tradespeople who match your job will call you back to discuss it and provide a fixed, written quote.'
        },
        {
          question: 'How quickly will I get responses?',
          answer: 'It varies by trade and area. We send you the brief as soon as your job is matched.'
        },
        {
          question: 'What can I see on a tradesperson\'s profile?',
          answer: 'Exactly what was checked — identity, business and insurance — so you know before you decide.'
        }
      ]
    },
    {
      title: 'Payments & Pricing',
      icon: CreditCard,
      questions: [
        {
          question: 'How much does it cost to hire a tradesperson?',
          answer: 'It depends on the trade and the job. Post your job and compare no-obligation quotes from matched tradespeople who call you back.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No. The price you agree with the tradesperson is what you pay — using MyApproved costs homeowners nothing.'
        },
        {
          question: 'What if I\'m not satisfied with the work?',
          answer: 'Talk to the tradesperson first. If it isn\'t resolved, email support@myapproved.com and we\'ll help.'
        }
      ]
    },
    {
      title: 'Safety & Trust',
      icon: Shield,
      questions: [
        {
          question: 'Are all tradespeople insured?',
          answer: "Yes — public liability insurance is a condition of listing. We confirm it's in date and keep monitoring it."
        },
        {
          question: 'What if something goes wrong?',
          answer: 'Email support@myapproved.com. We take every report seriously, and public liability cover is confirmed and monitored throughout.'
        },
        {
          question: 'How do I report a problem?',
          answer: 'Email support@myapproved.com. We take all reports seriously and investigate promptly.'
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy to-[#0A2463] text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
          <Container size="narrow" className="relative text-center pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
            <SectionHeaderPill>Instant Answers</SectionHeaderPill>
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4 text-white" style={{fontWeight: 800}}>
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Everything you need to know about finding and hiring verified tradespeople across the UK
            </p>

            {/* AEO answer block */}
            <div className="max-w-2xl mx-auto text-left bg-white/10 rounded-xl p-5 border border-white/20 mb-6" itemScope itemType="https://schema.org/FAQPage">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <p className="text-sm font-semibold text-brand-amber mb-1" itemProp="name">
                  How does MyApproved verify tradespeople?
                </p>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-sm text-blue-100 leading-relaxed" itemProp="text">
                    Every tradesperson passes identity, business and insurance checks before anyone appears on
                    the platform: photo ID verified against a live selfie, a business registered on Companies House,
                    and public liability insurance confirmed and monitored so the listing is withdrawn if it lapses.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ Content */}
        <Section>
          <Container size="narrow">
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-brand-amber/10 rounded-xl flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-brand-navy" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>{category.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <details key={index} className="group border border-gray-200 rounded-xl">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>{faq.question}</h3>
                          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                        </summary>
                        <div className="px-4 pb-4">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Contact Support */}
        <section className="py-16 bg-gray-50">
          <Container size="narrow" className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy mb-4" style={{fontWeight: 800}}>Still have questions?</h2>
            <p className="text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-brand-amber hover:bg-brand-amberDark text-black font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@myapproved.com"
                className="border-2 border-brand-amber text-brand-navy hover:bg-brand-amberDark hover:border-brand-amberDark hover:text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Email Support
              </a>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
