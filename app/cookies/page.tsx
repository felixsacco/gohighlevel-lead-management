import { generateMetadata } from '@/lib/seo';
import { Cookie, Settings, Eye, BarChart, Target } from 'lucide-react';

export const metadata = generateMetadata('cookies', {
  title: 'Cookie Policy | MyApproved - How We Use Cookies',
  description: 'Learn about how MyApproved uses cookies and similar technologies. Manage your cookie preferences and understand your choices.',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy', 'data collection'],
  canonical: 'https://myapproved.com/cookie-policy'
});

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-amber rounded-xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white" style={{ fontWeight: 800 }}>
              Cookie Policy
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
            Learn how we use cookies and similar technologies to improve your experience on MyApproved.
          </p>
          <p className="mt-4 text-sm text-blue-200">Last updated: June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-brand-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 lg:p-12">

            {/* Cookie Types Overview */}
            <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Settings, label: 'Essential', sub: 'Required for functionality' },
                { icon: BarChart, label: 'Analytics', sub: 'Help us improve' },
                { icon: Eye, label: 'Functional', sub: 'Remember preferences' },
                { icon: Target, label: 'Marketing', sub: 'Personalized ads' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-4 bg-brand-slate rounded-xl border border-gray-100 text-center">
                  <Icon className="w-6 h-6 text-brand-navy mx-auto mb-2" />
                  <div className="font-extrabold text-brand-navy" style={{ fontWeight: 800 }}>{label}</div>
                  <div className="text-xs text-slate-600">{sub}</div>
                </div>
              ))}
            </div>

            {/* Content Sections */}
            <div className="space-y-10">

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>What Are Cookies?</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    Cookies are small text files that are stored on your device when you visit our website.
                    They help us provide you with a better experience by remembering your preferences and
                    understanding how you use our platform.
                  </p>
                  <p>
                    We also use similar technologies like web beacons, pixels, and local storage to collect
                    information about your interactions with our services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Types of Cookies We Use</h2>

                <div className="space-y-6">
                  <div className="border border-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-extrabold text-brand-navy mb-3 flex items-center gap-2" style={{ fontWeight: 800 }}>
                      <Settings className="w-5 h-5" />
                      Essential Cookies (Always Active)
                    </h3>
                    <p className="text-slate-600 mb-3">
                      These cookies are necessary for our website to function properly. They cannot be disabled.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Authentication and security cookies</li>
                      <li>Session management cookies</li>
                      <li>Load balancing cookies</li>
                      <li>Cookie consent preferences</li>
                    </ul>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-extrabold text-brand-navy mb-3 flex items-center gap-2" style={{ fontWeight: 800 }}>
                      <BarChart className="w-5 h-5" />
                      Analytics Cookies
                    </h3>
                    <p className="text-slate-600 mb-3">
                      These help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Google Analytics (_ga, _gid, _gat)</li>
                      <li>Page view and user journey tracking</li>
                      <li>Performance monitoring</li>
                      <li>Error tracking and debugging</li>
                    </ul>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-extrabold text-brand-navy mb-3 flex items-center gap-2" style={{ fontWeight: 800 }}>
                      <Eye className="w-5 h-5" />
                      Functional Cookies
                    </h3>
                    <p className="text-slate-600 mb-3">
                      These cookies enable enhanced functionality and personalization.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Language and region preferences</li>
                      <li>Search filters and sorting preferences</li>
                      <li>Recently viewed tradespeople</li>
                      <li>Form auto-fill information</li>
                    </ul>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-extrabold text-brand-navy mb-3 flex items-center gap-2" style={{ fontWeight: 800 }}>
                      <Target className="w-5 h-5" />
                      Marketing Cookies
                    </h3>
                    <p className="text-slate-600 mb-3">
                      These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600">
                      <li>Google Ads</li>
                      <li>Retargeting and remarketing</li>
                      <li>Conversion tracking</li>
                      <li>Social media integration</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Third-Party Cookies</h2>
                <p className="text-slate-600 mb-4">
                  We work with trusted third-party services that may set their own cookies:
                </p>
                <div className="border border-gray-100 bg-brand-slate rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-navy">Analytics:</strong>
                      <ul className="list-disc pl-4 text-slate-600 mt-1">
                        <li>Google Analytics</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Marketing:</strong>
                      <ul className="list-disc pl-4 text-slate-600 mt-1">
                        <li>Google Ads</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Functionality:</strong>
                      <ul className="list-disc pl-4 text-slate-600 mt-1">
                        <li>Stripe (payments)</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Social Media:</strong>
                      <ul className="list-disc pl-4 text-slate-600 mt-1">
                        <li>Facebook</li>
                        <li>Twitter</li>
                        <li>LinkedIn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Managing Your Cookie Preferences</h2>
                <h3 className="text-lg font-extrabold text-brand-navy mb-3" style={{ fontWeight: 800 }}>Cookie Consent Banner</h3>
                <p className="text-slate-600 mb-4">
                  When you first visit our website, you'll see a cookie consent banner where you can:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-600 mb-6">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your preferences by category</li>
                  <li>Learn more about each cookie type</li>
                </ul>

                <h3 className="text-lg font-extrabold text-brand-navy mb-3" style={{ fontWeight: 800 }}>Browser Settings</h3>
                <p className="text-slate-600 mb-4">
                  You can also manage cookies through your browser settings:
                </p>
                <div className="border border-gray-100 bg-brand-slate rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-navy">Chrome:</strong>
                      <p className="text-slate-600">Settings → Privacy and Security → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Firefox:</strong>
                      <p className="text-slate-600">Options → Privacy & Security → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Safari:</strong>
                      <p className="text-slate-600">Preferences → Privacy → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-brand-navy">Edge:</strong>
                      <p className="text-slate-600">Settings → Cookies and Site Permissions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                  <p className="text-slate-600 text-sm">
                    <strong className="text-brand-navy">Note:</strong> Disabling certain cookies may affect the functionality of our website
                    and limit your ability to use some features.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Cookie Retention</h2>
                <p className="text-slate-600 mb-4">Different cookies have different lifespans:</p>
                <ul className="list-disc pl-6 space-y-1 text-slate-600">
                  <li><strong className="text-brand-navy">Session cookies:</strong> Deleted when you close your browser</li>
                  <li><strong className="text-brand-navy">Persistent cookies:</strong> Remain until expiry date or manual deletion</li>
                  <li><strong className="text-brand-navy">Analytics cookies:</strong> Typically expire after 2 years</li>
                  <li><strong className="text-brand-navy">Marketing cookies:</strong> Usually expire after 30-90 days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Updates to This Policy</h2>
                <p className="text-slate-600">
                  We may update this cookie policy from time to time to reflect changes in our practices
                  or for legal reasons. We will notify you of any significant changes by updating the
                  "last updated" date at the top of this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>Contact Us</h2>
                <p className="text-slate-600 mb-4">If you have questions about our use of cookies:</p>
                <div className="border border-gray-100 bg-brand-slate p-6 rounded-xl">
                  <div className="text-slate-600">
                    <strong className="text-brand-navy">Email:</strong>{' '}
                    <a href="mailto:support@myapproved.com" className="text-brand-navy hover:text-brand-amberDark underline">support@myapproved.com</a>
                  </div>
                </div>
              </section>

            </div>

            {/* Last Updated */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-slate-600">
              This cookie policy was last updated in June 2026.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
