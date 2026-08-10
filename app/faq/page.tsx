import { generateMetadata } from '@/lib/seo';
import { HelpCircle, ChevronDown, Search, Shield, Users, CreditCard } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export const metadata = generateMetadata('faq', {
  title: 'FAQ - Frequently Asked Questions About Hiring Tradespeople | MyApproved',
  description: 'Answers to the most common questions about finding verified tradespeople in the UK - how verification works, pricing, insurance, and more. Free to use for homeowners.',
  keywords: ['FAQ tradespeople UK', 'frequently asked questions', 'how does MyApproved work', 'tradesperson verification', 'free quotes UK'],
  canonical: 'https://myapproved.com/faq'
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does MyApproved work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MyApproved connects homeowners across the UK with verified tradespeople. Post your job or request quotes, receive responses from qualified local professionals, compare their profiles and reviews, then hire the best person for your project - completely free for homeowners."
      }
    },
    {
      "@type": "Question",
      "name": "Is MyApproved free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, posting jobs and requesting quotes is completely free for homeowners. Tradespeople pay a small fee per lead or a monthly subscription - homeowners never pay anything to use MyApproved."
      }
    },
    {
      "@type": "Question",
      "name": "How are tradespeople verified on MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All tradespeople undergo rigorous verification including government-issued ID checks, insurance verification (minimum £2M public liability), qualification checks (e.g. Gas Safe, NICEIC, FENSA), and reference verification before they can appear on the platform."
      }
    },
    {
      "@type": "Question",
      "name": "Are all tradespeople on MyApproved insured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All tradespeople on MyApproved must hold valid public liability insurance of at least £2 million and provide proof before joining. Insurance is re-verified annually."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to hire a tradesperson through MyApproved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Costs vary by trade and job. Plumbers typically charge £40–£70/hour; electricians £45–£75/hour; builders £35–£60/hour. Get free no-obligation quotes from up to 3 verified tradespeople to compare exact costs for your project."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly can I find a tradesperson near me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most homeowners receive their first quote within a few hours. For urgent or emergency jobs, many MyApproved tradespeople offer same-day availability. Post your job and you'll typically receive 3 quotes within 24 hours."
      }
    },
    {
      "@type": "Question",
      "name": "What if I'm not satisfied with the work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MyApproved has a dispute resolution process. Contact our support team and we'll help resolve any issues with the tradesperson, including mediation and guidance on next steps."
      }
    }
  ]
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Users,
      questions: [
        {
          question: 'How does MyApproved work?',
          answer: 'MyApproved connects homeowners across the UK with verified tradespeople. Post your job or request quotes, receive responses from qualified local professionals, compare their profiles and reviews, then hire the best person for your project - completely free for homeowners.'
        },
        {
          question: 'Is MyApproved free to use?',
          answer: 'Yes, posting jobs and requesting quotes is completely free for homeowners. Tradespeople pay a small fee per lead or a monthly subscription - you never pay anything to use MyApproved.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Click "Sign Up" in the top right corner, choose whether you\'re a homeowner or tradesperson, fill in your details, and verify your email address. It takes less than 2 minutes!'
        }
      ]
    },
    {
      title: 'Finding Tradespeople',
      icon: Search,
      questions: [
        {
          question: 'How are tradespeople verified?',
          answer: 'All tradespeople undergo rigorous verification including government ID checks, insurance verification (minimum £2M public liability), qualification checks (Gas Safe, NICEIC, FENSA etc.), and reference verification before listing on our platform.'
        },
        {
          question: 'How many quotes will I receive?',
          answer: 'You typically receive 3–5 quotes from qualified tradespeople in your area. The exact number depends on availability and the type of work required.'
        },
        {
          question: 'How quickly will I get responses?',
          answer: 'Most homeowners receive their first quote within a few hours. For urgent or emergency jobs, many MyApproved tradespeople offer same-day service.'
        },
        {
          question: 'Can I see reviews and ratings?',
          answer: 'Yes, every tradesperson has a detailed profile showing their average rating, customer reviews, completed projects, qualifications, and full verification status.'
        }
      ]
    },
    {
      title: 'Payments & Pricing',
      icon: CreditCard,
      questions: [
        {
          question: 'How much does it cost to hire a tradesperson?',
          answer: 'Costs vary by trade. Plumbers charge £40–£70/hour; electricians £45–£75/hour; builders £35–£60/hour. Get free no-obligation quotes to compare exact costs for your project.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees for homeowners. The price you agree with the tradesperson is what you pay. MyApproved is completely free for homeowners to use.'
        },
        {
          question: 'What if I\'m not satisfied with the work?',
          answer: 'We have a dispute resolution process. If you\'re not satisfied, contact our support team and we\'ll help resolve the issue with the tradesperson through mediation and guidance.'
        }
      ]
    },
    {
      title: 'Safety & Trust',
      icon: Shield,
      questions: [
        {
          question: 'Are all tradespeople insured?',
          answer: 'Yes, all tradespeople on MyApproved must hold valid public liability insurance of at least £2 million and provide proof before joining our platform. Insurance is re-verified annually.'
        },
        {
          question: 'What if something goes wrong?',
          answer: 'Contact our support team through the platform, email, or phone. We have comprehensive dispute resolution processes and take all reports seriously, investigating promptly and fairly.'
        },
        {
          question: 'How do I report a problem?',
          answer: 'Contact our support team immediately at support@myapproved.com. We take all reports seriously and investigate within 24 hours.'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-900 text-white overflow-hidden min-h-[50vh] flex items-start pt-8 sm:pt-12">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-blue-800/70 to-indigo-800/60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.2),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>

          <Container size="narrow" className="relative text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-yellow-400 mb-6">
              <HelpCircle className="w-4 h-4" />
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Instant Answers
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-yellow-200 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Everything you need to know about finding and hiring verified tradespeople across the UK
            </p>

            {/* AEO answer block */}
            <div className="max-w-2xl mx-auto text-left bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 mb-6" itemScope itemType="https://schema.org/FAQPage">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <p className="text-sm font-semibold text-yellow-300 mb-1" itemProp="name">
                  How does MyApproved verify tradespeople?
                </p>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-sm text-blue-100 leading-relaxed" itemProp="text">
                    Every tradesperson on MyApproved passes identity verification, insurance confirmation (minimum £2M public liability),
                    and qualification checks (Gas Safe, NICEIC, FENSA where applicable) before appearing on the platform. Verification is
                    repeated annually. Homeowners across the UK can hire with complete confidence - all tradespeople are pre-screened before
                    they can receive a single quote request.
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
                <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <details key={index} className="group border border-gray-200 rounded-lg">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@myapproved.com"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors"
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
