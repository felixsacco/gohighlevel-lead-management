import { Heart, Shield, Users, CheckCircle, Award, Target } from "lucide-react";
import Link from "next/link";

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
      <section className="bg-[#1A3A8A] text-white pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F5B301] text-black text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" />
            Our Mission
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">About MyApproved</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            We're building the UK's most trusted platform for connecting homeowners with verified, approved tradespeople.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 text-base leading-relaxed">
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
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What We Stand For</h2>
            <p className="text-gray-500 text-sm">The principles behind everything we build</p>
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
                body: "Homeowners use the platform free of charge. Tradespeople pay a transparent subscription. No hidden commissions or surprise fees.",
              },
              {
                icon: Award,
                title: "Real Reviews Only",
                body: "Reviews come from confirmed jobs only. Tradespeople cannot edit or remove them. What you read is what real customers experienced.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-[#1A3A8A] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment checklist */}
      <section className="bg-[#1A3A8A] py-14 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Commitment</h2>
              <ul className="space-y-3">
                {[
                  "Rigorous verification for every tradesperson before listing",
                  "Public liability insurance required as a minimum",
                  "Trade qualifications and certifications checked",
                  "Reviews verified from real completed jobs only",
                  "Transparent subscription pricing for tradespeople",
                  "Free to use for all homeowners — no fees, ever",
                  "Support available via email for homeowners and trades",
                  "Governed by English law, built for the UK market",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#F5B301] shrink-0 mt-0.5" />
                    <span className="text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Trades covered", value: "24+" },
                { label: "UK-wide coverage", value: "Nationwide" },
                { label: "Verification steps", value: "5-point" },
                { label: "Free for homeowners", value: "Always" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-xl p-5 text-center">
                  <div className="text-2xl font-bold text-[#F5B301] mb-1">{value}</div>
                  <div className="text-blue-200 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For tradespeople */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Are you a tradesperson?</h3>
              <p className="text-gray-600 text-sm">Join the platform, get your profile verified, and start receiving leads from homeowners in your area.</p>
            </div>
            <Link
              href="/for-tradespeople"
              className="shrink-0 bg-[#1A3A8A] hover:bg-[#152d6e] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Join MyApproved
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
