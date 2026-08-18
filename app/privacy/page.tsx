import { Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MyApproved",
  description: "How MyApproved collects, uses, and protects your personal data. Full GDPR-compliant privacy policy.",
  alternates: { canonical: "https://myapproved.com/privacy" },
};

export default function PrivacyPolicy() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A3A8A] text-white pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F5B301] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Privacy Policy</h1>
          </div>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information when you use MyApproved.
          </p>
          <p className="text-blue-300 text-sm mt-4">Last updated: June 2026</p>
        </div>
      </section>

      {/* Quick badges */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Lock, label: "Data encrypted in transit and at rest" },
              { icon: UserCheck, label: "GDPR compliant" },
              { icon: Database, label: "Minimal data collection" },
              { icon: Eye, label: "No data sold to third parties" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-100">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12 space-y-10 text-gray-700 text-sm leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who We Are</h2>
              <p>MyApproved is an online platform that connects homeowners with verified tradespeople across the UK. This policy covers all personal data processed through our website at <a href="https://myapproved.com" className="text-[#1A3A8A] underline">myapproved.com</a> and associated services.</p>
              <p className="mt-2">For privacy enquiries, email us at <a href="mailto:support@myapproved.com" className="text-[#1A3A8A] underline">support@myapproved.com</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <h3 className="font-semibold text-gray-800 mb-1.5">When you register</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Name and email address</li>
                <li>Phone number (optional for customers, required for tradespeople)</li>
                <li>Postcode and address for location-based matching</li>
                <li>Trade qualifications, insurance documents, and identity verification (tradespeople only)</li>
              </ul>
              <h3 className="font-semibold text-gray-800 mb-1.5">When you use the platform</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Job descriptions, quotes, and messages exchanged through the platform</li>
                <li>Search queries and pages visited</li>
                <li>Device type and browser information</li>
                <li>IP address and approximate location</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To match homeowners with suitable verified tradespeople</li>
                <li>To verify tradesperson credentials, insurance, and identity</li>
                <li>To process payments and manage subscriptions (via Stripe)</li>
                <li>To send transactional emails and account notifications</li>
                <li>To improve our platform through aggregated usage analytics</li>
                <li>To comply with legal obligations and prevent fraud</li>
              </ul>
              <p className="mt-3">We do not use your data for targeted advertising or sell it to third parties.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
              <p>We only share your information in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>With tradespeople when you request a quote or book a job (your name, contact details, and job description)</li>
                <li>With Stripe for secure payment processing</li>
                <li>With service providers who help us operate our platform (hosting, email delivery) under strict data processing agreements</li>
                <li>When required by law, court order, or to protect the rights and safety of our users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>All data is encrypted in transit using TLS/SSL</li>
                <li>Databases are encrypted at rest</li>
                <li>Access to personal data is restricted to authorised staff only</li>
                <li>We use Supabase for secure, GDPR-compliant data storage hosted in the EU</li>
                <li>Payment data is handled exclusively by Stripe and never stored on our servers</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights Under GDPR</h2>
              <p>As a UK or EU resident, you have the following rights:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
                <li><strong>Rectification:</strong> Ask us to correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Ask us to limit how we process your data</li>
                <li><strong>Objection:</strong> Object to processing for direct marketing</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email <a href="mailto:support@myapproved.com" className="text-[#1A3A8A] underline">support@myapproved.com</a>. We will respond within 30 days.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
              <p>We use cookies to keep you signed in, remember your preferences, and understand how people use our site. We do not use advertising cookies. You can manage cookie preferences via your browser settings or our cookie consent banner.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account data: retained until you delete your account or the account is inactive for 3 years</li>
                <li>Transaction records: retained for 7 years to comply with HMRC requirements</li>
                <li>Analytics data: anonymised after 14 months</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
              <p>For any privacy-related questions or to exercise your rights:</p>
              <div className="mt-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1A3A8A]" />
                <a href="mailto:support@myapproved.com" className="text-[#1A3A8A] font-medium underline">support@myapproved.com</a>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
              This privacy policy was last updated in June 2026. We will notify you of significant changes via email or in-platform notification.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
