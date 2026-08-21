import { BadgeCheck, Shield, CheckCircle } from "lucide-react";

interface TrustEngineSectionProps {
  tradeName?: string;
  tradePlural?: string;
  className?: string;
}

const CHECKS = [
  {
    step: "01",
    title: "Identity checked",
    detail:
      "Every applicant submits a government-issued photo ID, which is verified against a live selfie before their profile is created. No identity match — no listing.",
    icon: <BadgeCheck className="w-6 h-6 text-[#16A34A]" />,
  },
  {
    step: "02",
    title: "Business verified",
    detail:
      "The business is confirmed as registered on Companies House. Every professional listed trades under a real, registered company.",
    icon: <CheckCircle className="w-6 h-6 text-[#16A34A]" />,
  },
  {
    step: "03",
    title: "Insurance confirmed and monitored",
    detail:
      "Public liability insurance is confirmed genuine and in date before listing, and cover is monitored so the listing is withdrawn if it lapses.",
    icon: <Shield className="w-6 h-6 text-[#16A34A]" />,
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
            How verification works
          </p>
          <h2
            id="trust-engine-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mb-4"
          >
            Three checks before any {tradeName} can be listed
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            No {tradeName} appears on MyApproved until their identity, business and insurance
            checks have passed. Each check is confirmed on their public profile, not self-declared.
          </p>
        </div>

        {/* 3 checks */}
        <div className="space-y-6 mb-12">
          {CHECKS.map((check) => (
            <div
              key={check.step}
              className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              <div className="grid sm:grid-cols-[auto_1fr] items-start gap-4 sm:gap-6 p-6 sm:p-8">
                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  {check.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-0.5">
                    Step {check.step}
                  </div>
                  <h3 className="font-extrabold text-brand-navy mb-2 text-base sm:text-lg">
                    {check.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{check.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monitoring callout */}
        <div className="rounded-xl bg-[#f0f4ff] border border-brand-navy/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-shrink-0 w-12 h-12 bg-brand-navy rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-brand-navy text-lg mb-1">Checked once, monitored always</div>
            <p className="text-sm text-gray-600">
              A {tradeName}'s insurance cover stays monitored after they're listed. If cover lapses
              or a check falls out of date, the listing is withdrawn until it's put right.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
