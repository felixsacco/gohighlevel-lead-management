import Link from "next/link";
import { Mail, Shield, CheckCircle, Users, Wrench, Star, Award, HelpCircle, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  title: "Help Centre | MyApproved",
  description: "Find answers to common questions about finding verified tradespeople, posting jobs, getting quotes, and managing your account on MyApproved.",
  alternates: { canonical: "https://myapproved.com/help" },
};

const faqCategories = [
  {
    title: "Getting Started",
    icon: Users,
    questions: [
      {
        q: "How do I find a tradesperson?",
        a: "Use the search on our homepage or visit the Find Tradespeople page. Filter by trade type and location. Every tradesperson listed has been verified before appearing on the platform.",
      },
      {
        q: "How do I get a quote?",
        a: "Click 'Get Quote' on any tradesperson's profile or use our instant quote tool. Describe your job and location and we'll connect you with verified professionals who can respond with accurate quotes.",
      },
      {
        q: "Is MyApproved free for homeowners?",
        a: "Yes. Finding tradespeople, requesting quotes, and communicating through the platform is completely free for homeowners. You only pay the tradesperson directly for the work done.",
      },
      {
        q: "How quickly can I expect a response?",
        a: "Many tradespeople respond within a few hours. Response times are shown on their profiles. For urgent work, look for tradespeople with a fast response badge.",
      },
    ],
  },
  {
    title: "For Customers",
    icon: Wrench,
    questions: [
      {
        q: "How do I know a tradesperson is verified?",
        a: "All tradespeople on MyApproved go through identity verification, insurance checks, and qualification reviews before their profile goes live. Verified badges on profiles confirm this.",
      },
      {
        q: "What if I'm not happy with the work?",
        a: "Contact our support team at support@myapproved.com as soon as possible. We will work with you and the tradesperson to find a resolution. We take quality disputes seriously.",
      },
      {
        q: "Can I leave a review?",
        a: "Yes. After a job is completed you will be prompted to leave an honest review. Reviews are verified and cannot be edited or removed by tradespeople.",
      },
    ],
  },
  {
    title: "For Tradespeople",
    icon: Star,
    questions: [
      {
        q: "How do I join MyApproved?",
        a: "Visit the 'For Tradespeople' page and click 'Join MyApproved'. Complete the registration form, upload your documents, and our team will review your application within 2 to 3 business days.",
      },
      {
        q: "What documents do I need?",
        a: "You'll need proof of public liability insurance, relevant trade qualifications, and a valid form of ID. Some trades may require additional certifications such as Gas Safe or NICEIC registration.",
      },
      {
        q: "How much does it cost to join?",
        a: "Joining is £4.99 a lead, pay as you go. You only pay when a lead is worth taking - there are no monthly fees or subscription. There is no commission taken from jobs - you keep everything you earn.",
      },
    ],
  },
  {
    title: "Account & Billing",
    icon: Award,
    questions: [
      {
        q: "How do I update my profile?",
        a: "Log into your account and go to your Dashboard. You can update your information, upload photos of your work, adjust availability, and manage notification settings.",
      },
      {
        q: "How do I cancel or pause my account?",
        a: "Because there is no ongoing subscription, you can pause taking new leads at any time from your account settings. You are only ever charged for the leads you choose to take.",
      },
      {
        q: "What payment methods do you accept?",
        a: "All major credit and debit cards are accepted. Payments are processed securely through our payment provider. We do not store your card details.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[0.72rem] sm:text-xs font-semibold tracking-[0.22em] uppercase text-brand-amber mb-8 sm:mb-12">
              Help Centre
            </p>
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4 text-white" style={{fontWeight: 800}}>How Can We Help?</h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Answers for homeowners and tradespeople using MyApproved.
            </p>
          </div>
        </div>
      </section>

      {/* Contact card strip */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
              <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Email Support</p>
                <a href="mailto:support@myapproved.com" className="text-brand-navy text-sm font-medium">support@myapproved.com</a>
                <p className="text-gray-600 text-xs mt-0.5">Reply within one business day</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
              <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Verified Platform</p>
                <p className="text-gray-600 text-sm">All tradespeople ID-checked</p>
                <p className="text-gray-600 text-xs mt-0.5">Insurance &amp; qualifications verified</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
              <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Free for Homeowners</p>
                <p className="text-gray-600 text-sm">No fees to find &amp; hire</p>
                <p className="text-gray-600 text-xs mt-0.5">Pay only the tradesperson</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="bg-[#F1F5F9] py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {faqCategories.map((cat) => (
            <div key={cat.title} className="bg-white rounded-xl border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center">
                  <cat.icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>{cat.title}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.questions.map((faq, i) => (
                  <AccordionItem key={i} value={`${cat.title}-${i}`} className="border border-gray-100 rounded-xl px-4">
                    <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-navy py-12 sm:py-16 md:py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 text-white" style={{fontWeight: 800}}>Still need help?</h2>
          <p className="text-white/75 text-sm mb-6">Our support team is happy to assist. Email us and we'll get back to you within one business day.</p>
          <a
            href="mailto:support@myapproved.com"
            className="inline-flex items-center gap-2 bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Support
          </a>
        </div>
      </section>
    </>
  );
}
