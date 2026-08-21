import { Shield, Users, CheckCircle, Award } from "lucide-react";
import Link from "next/link";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";

export const metadata = {
  title: "About MyApproved - Verified Tradespeople Platform UK",
  description: "MyApproved connects UK homeowners with identity-checked, insured tradespeople nationwide. Learn about our mission, verification process, and values.",
  alternates: { canonical: "https://myapproved.com/about" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://myapproved.com/about",
  "url": "https://myapproved.com/about",
  "name": "About MyApproved",
  "mainEntity": {
    "@type": "Organization",
    "@id": "https://myapproved.com/#organization",
    "name": "MyApproved",
    "url": "https://myapproved.com",
    "logo": { "@type": "ImageObject", "url": "https://myapproved.com/logo-icon.svg" },
    "description": "MyApproved is a UK-wide platform connecting homeowners with verified, insured tradespeople.",
    "areaServed": { "@type": "Country", "name": "United Kingdom" },
  },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <SectionHeaderPill>Our Mission</SectionHeaderPill>
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4 text-white" style={{fontWeight: 800}}>About MyApproved</h1>
            <p className="text-white/75 text-base sm:text-lg max-w-2xl mx-auto">
              We're building the UK's most trusted platform for connecting homeowners with verified, approved tradespeople.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-6" style={{fontWeight: 800}}>Our Story</h2>
          <div className="max-w-3xl space-y-4 text-gray-600 text-base leading-relaxed">
            <p>
              MyApproved was founded after one too many homeowners had a bad experience hiring a tradesperson they couldn't properly vet. Whether it was unfinished work, no insurance, or simply no way to verify credentials — the problem was the same: there was no reliable way to know who you were letting into your home.
            </p>
            <p>
              We set out to fix that. Every tradesperson on MyApproved goes through a real verification process before their profile goes live — identity checks, public liability insurance, relevant trade qualifications, and where required, certifications like Gas Safe or NICEIC. No shortcuts.
            </p>
            <p>
              We're based in the UK and built specifically for the UK market. Our focus is simple: give homeowners confidence that the person they hire is who they say they are, holds the right qualifications, and is properly insured.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F1F5F9] py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>What We Stand For</h2>
            <p className="text-gray-600 text-base sm:text-lg">The principles behind everything we build</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Verified First",
                body: "Every tradesperson is identity-checked and insurance-verified before appearing on the platform. No unverified listings.",
              },
              {
                icon: Users,
                title: "Fair to Both Sides",
                body: "Homeowners use the platform free of charge. Tradespeople pay £4.99 a lead, pay as you go - no monthly subscription, no hidden commissions.",
              },
              {
                icon: Award,
                title: "Real Reviews Only",
                body: "Reviews come from confirmed jobs only. Tradespeople cannot edit or remove them. What you read is what real customers experienced.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl p-4 sm:p-5 md:p-6 text-center">
                <div className="w-12 h-12 bg-brand-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment checklist */}
      <section className="bg-brand-navy py-12 sm:py-16 md:py-20 lg:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6" style={{fontWeight: 800}}>Our Commitment</h2>
              <ul className="space-y-3">
                {[
                  "Rigorous verification for every tradesperson before listing",
                  "Public liability insurance required as a minimum",
                  "Trade qualifications and certifications checked",
                  "Reviews verified from real completed jobs only",
                  "£4.99 a lead, pay as you go for tradespeople",
                  "Free to use for all homeowners — no fees, ever",
                  "Support available via email for homeowners and trades",
                  "Governed by English law, built for the UK market",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                    <span className="text-white/75">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Trades covered", value: "33" },
                { label: "UK-wide coverage", value: "Nationwide" },
                { label: "Verification checks", value: "4" },
                { label: "Free for homeowners", value: "Always" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-xl p-5 text-center">
                  <div className="text-2xl font-bold text-brand-amber mb-1">{value}</div>
                  <div className="text-blue-100 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For tradespeople */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F1F5F9] rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy mb-1" style={{fontWeight: 800}}>Are you a tradesperson?</h3>
              <p className="text-gray-600 text-sm">Join the platform, get your profile verified, and start receiving leads from homeowners in your area.</p>
            </div>
            <Link
              href="/for-tradespeople"
              className="shrink-0 bg-brand-navy hover:bg-brand-navy text-white font-bold px-8 sm:px-10 py-5 text-base sm:text-lg rounded-xl transition-colors whitespace-nowrap" style={{fontWeight: 800}}
            >
              Join MyApproved
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
