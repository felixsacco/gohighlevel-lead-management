import { Shield, BadgeCheck, Star, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TrustEngineSectionProps {
  tradeName?: string;
  tradePlural?: string;
  className?: string;
}

const VERIFICATION_PILLARS = [
  {
    step: "01",
    title: "Government-Issued ID Verification",
    detail:
      "Every applicant submits a government-issued photo ID. MyApproved checks it against official identity records before the profile is created. No ID match - no listing.",
    checkatrade: "Self-declared. Checkatrade does not independently verify identity documents against official records.",
    icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
  },
  {
    step: "02",
    title: "£2M Public Liability Insurance Confirmation",
    detail:
      "Certificate of insurance is submitted at onboarding and verified against the insurer directly. Cover level, policy status, and expiry are all checked. Renewals trigger automatic re-verification.",
    checkatrade: "Self-uploaded. MyBuilder and Checkatrade accept insurance certificates without independent insurer confirmation.",
    icon: <Shield className="w-6 h-6 text-green-600" />,
  },
  {
    step: "03",
    title: "Trade Qualification Check",
    detail:
      "Regulated trades (Gas Safe, NICEIC, NAPIT, FENSA, MCS, OFTEC) are verified against the live official register - not self-declared. Lapsed or suspended registrations are flagged immediately.",
    checkatrade: "Checkatrade states tradespeople 'may' hold relevant qualifications. MyJobQuote does not verify regulated trade credentials.",
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
  },
  {
    step: "04",
    title: "Customer Reference Screening",
    detail:
      "Applicants provide references from recent completed jobs. MyApproved contacts referees independently. Reviews on the platform are gated to confirmed bookings only - no anonymous or self-submitted ratings.",
    checkatrade: "Checkatrade reviews can be left by anyone, not just confirmed customers. Review authenticity is not independently verified.",
    icon: <Star className="w-6 h-6 text-green-600" />,
  },
];

export default function TrustEngineSection({
  tradeName = "tradesperson",
  tradePlural = "tradespeople",
  className = "",
}: TrustEngineSectionProps) {
  return (
    <section
      className={`py-14 sm:py-18 bg-white ${className}`}
      aria-labelledby="trust-engine-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-navy mb-2">
            The MyApproved Difference
          </p>
          <h2
            id="trust-engine-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mb-4"
          >
            Why MyApproved verification outperforms Checkatrade
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Checkatrade, MyBuilder, and MyJobQuote accept self-reported credentials.
            MyApproved independently verifies every {tradeName} against official records before they can quote.
          </p>
        </div>

        {/* Pricing comparison bar */}
        <div className="mb-12 rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <div className="p-6 bg-[#f0f4ff]">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-navy mb-1">MyApproved</div>
              <div className="text-3xl font-extrabold text-brand-navy mb-1">£4.99 <span className="text-base font-semibold text-gray-600">/ lead</span></div>
              <p className="text-sm text-gray-600">Pay only when you accept a lead. No monthly subscription required.</p>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                <XCircle className="w-4 h-4 text-red-400" /> Checkatrade
              </div>
              <div className="text-3xl font-extrabold text-gray-400 mb-1">£300+ <span className="text-base font-semibold text-gray-400">/ month</span></div>
              <p className="text-sm text-gray-500">Fixed subscription regardless of lead volume. Trades locked in for 12-month contracts.</p>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                <XCircle className="w-4 h-4 text-red-400" /> MyBuilder / MyJobQuote
              </div>
              <div className="text-3xl font-extrabold text-gray-400 mb-1">£15–£80 <span className="text-base font-semibold text-gray-400">/ lead</span></div>
              <p className="text-sm text-gray-500">Variable lead cost up to £80. Same lead sold to multiple competing trades simultaneously.</p>
            </div>
          </div>
        </div>

        {/* 4 verification pillars */}
        <div className="space-y-6 mb-12">
          {VERIFICATION_PILLARS.map((pillar) => (
            <div
              key={pillar.step}
              className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              <div className="grid sm:grid-cols-2">
                {/* MyApproved */}
                <div className="p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      {pillar.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-0.5">
                        Step {pillar.step} · MyApproved
                      </div>
                      <h3 className="font-extrabold text-brand-navy mb-2 text-base sm:text-lg">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{pillar.detail}</p>
                    </div>
                  </div>
                </div>

                {/* Competitor */}
                <div className="p-6 sm:p-8 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
                        How competitors handle this
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{pillar.checkatrade}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annual re-verification callout */}
        <div className="rounded-xl bg-[#f0f4ff] border border-brand-navy/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
          <div className="flex-shrink-0 w-12 h-12 bg-brand-navy rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-brand-navy text-lg mb-1">Annual re-verification - not a one-time check</div>
            <p className="text-sm text-gray-600">
              Every {tradeName} on MyApproved is re-verified every 12 months. Insurance lapses, suspended Gas Safe registrations, and revoked qualifications
              trigger immediate account suspension - before any homeowner can be affected. Checkatrade and MyBuilder do not operate an automated annual re-verification system.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/instant-quote"
            className="inline-flex items-center gap-2 bg-brand-navy text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-navy transition-colors text-base"
          >
            Get Free Verified {tradePlural.charAt(0).toUpperCase() + tradePlural.slice(1)} Quotes
            <CheckCircle className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Free for homeowners · No obligation · Quotes within hours
          </p>
        </div>

      </div>
    </section>
  );
}
