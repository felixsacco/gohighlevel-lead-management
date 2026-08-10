import { FileText, Shield, AlertTriangle, CheckCircle, Users, Scale } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | MyApproved",
  description: "MyApproved terms and conditions. Understand your rights and responsibilities when using our tradesperson platform.",
  alternates: { canonical: "https://myapproved.com/terms" },
};

export default function TermsAndConditions() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1A3A8A] text-white pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFB800] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Terms &amp; Conditions</h1>
          </div>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl">
            These terms govern your use of MyApproved. Please read them carefully before using our platform.
          </p>
          <p className="text-blue-300 text-sm mt-4">Last updated: June 2026</p>
        </div>
      </section>

      {/* Key points strip */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            {[
              { icon: CheckCircle, label: "Free for homeowners to use" },
              { icon: Users, label: "Separate terms for clients and tradespeople" },
              { icon: Shield, label: "We verify tradespeople but do not guarantee work quality" },
              { icon: Scale, label: "English law governs these terms" },
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using MyApproved ("the Platform"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use our services. These terms apply to all users - both homeowners seeking services and tradespeople offering them.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. About MyApproved</h2>
              <p>MyApproved is an online platform that connects homeowners and property managers ("Clients") with verified tradespeople and service providers ("Tradespeople") across the UK. We facilitate introductions and provide a marketplace for quotes and bookings. We are not a party to any contract between Clients and Tradespeople.</p>
              <ul className="list-disc pl-5 space-y-1 mt-3">
                <li>Tradesperson verification and credential checks</li>
                <li>Quote request and matching system</li>
                <li>Messaging and communication tools</li>
                <li>Review and rating system</li>
                <li>Payment facilitation (via Stripe)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
              <h3 className="font-semibold text-gray-800 mb-1.5">All users must:</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete information</li>
                <li>Keep login credentials secure and confidential</li>
                <li>Maintain only one account per person or business</li>
                <li>Notify us immediately of any unauthorised account access</li>
              </ul>
              <h3 className="font-semibold text-gray-800 mb-1.5">Tradespeople must additionally provide:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Valid business registration or sole trader documentation</li>
                <li>Public liability insurance (minimum £1 million cover)</li>
                <li>Relevant trade qualifications and certifications</li>
                <li>Identity verification and right to work in the UK</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Client Terms</h2>
              <p>As a client you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide accurate job descriptions and requirements</li>
                <li>Respond to tradesperson messages in a timely manner</li>
                <li>Allow reasonable access to your property for assessments and work</li>
                <li>Pay the tradesperson the agreed amount for completed work</li>
                <li>Not misuse the platform to obtain quotes without genuine intent to hire</li>
              </ul>
              <p className="mt-3">All contracts and payment terms are agreed directly between you and the tradesperson. MyApproved is not responsible for any disputes arising from the work.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Tradesperson Terms</h2>
              <p>As a tradesperson you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Maintain all required licences, insurance, and certifications at all times</li>
                <li>Provide accurate, honest quotes and realistic project timelines</li>
                <li>Carry out all work to relevant industry standards and building regulations</li>
                <li>Communicate professionally with clients and respond promptly</li>
                <li>Honor agreed prices and terms</li>
                <li>Not contact clients outside the platform for jobs introduced through MyApproved</li>
              </ul>
              <p className="mt-3">Platform fees (per-lead or subscription) are clearly disclosed at sign-up and prior to any charge.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Prohibited Conduct</h2>
              <p>You must not use the platform to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or discriminate against any user</li>
                <li>Circumvent our verification or payment systems</li>
                <li>Post spam or unsolicited commercial communications</li>
                <li>Attempt to access systems or data without authorisation</li>
                <li>Infringe any third party's intellectual property rights</li>
                <li>Create multiple accounts to evade restrictions or bans</li>
              </ul>
              <p className="mt-3">We reserve the right to suspend or permanently remove any account that violates these terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Disclaimers</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <p className="text-amber-800 text-sm"><strong>Important:</strong> MyApproved is a platform service. We verify tradespeople's credentials, but we do not supervise, manage, or guarantee the quality, safety, or outcome of any work carried out. All contracts are directly between clients and tradespeople.</p>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Platform availability is not guaranteed at all times</li>
                <li>We may update, modify, or discontinue features at any time</li>
                <li>We are not liable for indirect losses, lost profits, or consequential damages</li>
                <li>Our total liability to any user shall not exceed the fees paid to us in the preceding 12 months</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Dispute Resolution</h2>
              <p>If you have a dispute with a tradesperson, we encourage you to first attempt to resolve it directly. If that fails, contact our support team at <a href="mailto:support@myapproved.com" className="text-[#1A3A8A] underline">support@myapproved.com</a> and we will do our best to assist.</p>
              <p className="mt-2">Any disputes with MyApproved itself will be governed by English law and subject to the exclusive jurisdiction of English courts.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to These Terms</h2>
              <p>We may update these terms from time to time. We will notify you of significant changes by email or through a platform notice. Continued use of MyApproved after changes are published constitutes your acceptance of the updated terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>For questions about these terms:</p>
              <p className="mt-2"><a href="mailto:support@myapproved.com" className="text-[#1A3A8A] font-medium underline">support@myapproved.com</a></p>
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400">
              These terms were last updated in June 2026. By using MyApproved you confirm you have read and accepted these terms.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
