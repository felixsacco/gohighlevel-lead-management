import { generateMetadata } from '@/lib/seo';
import { Cookie, Settings, Eye, BarChart, Target } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export const metadata = generateMetadata('cookies', {
  title: 'Cookie Policy | MyApproved - How We Use Cookies',
  description: 'Learn about how MyApproved uses cookies and similar technologies. Manage your cookie preferences and understand your choices.',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy', 'data collection'],
  canonical: 'https://myapproved.com/cookie-policy'
});

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Section className="pb-16 pt-8 sm:pt-12 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <Container size="narrow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Cookie className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-xl text-blue-100">
            Learn how we use cookies and similar technologies to improve your experience on MyApproved.
          </p>
          <div className="mt-6 text-sm text-blue-200">
            Last updated: June 2026
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section>
        <Container size="narrow" className="py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          
          {/* Cookie Types Overview */}
          <div className="mb-12 grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <Settings className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Essential</div>
              <div className="text-xs text-green-700">Required for functionality</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <BarChart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-800">Analytics</div>
              <div className="text-xs text-blue-700">Help us improve</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-800">Functional</div>
              <div className="text-xs text-purple-700">Remember preferences</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
              <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-orange-800">Marketing</div>
              <div className="text-xs text-orange-700">Personalized ads</div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-4">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
                <p className="text-gray-700">
                  We also use similar technologies like web beacons, pixels, and local storage to collect 
                  information about your interactions with our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Essential Cookies (Always Active)
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are necessary for our website to function properly. They cannot be disabled.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Authentication and security cookies</li>
                    <li>Session management cookies</li>
                    <li>Load balancing cookies</li>
                    <li>Cookie consent preferences</li>
                  </ul>
                </div>

                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Google Analytics (_ga, _gid, _gat)</li>
                    <li>Page view and user journey tracking</li>
                    <li>Performance monitoring</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>

                <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Functional Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies enable enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Language and region preferences</li>
                    <li>Search filters and sorting preferences</li>
                    <li>Recently viewed tradespeople</li>
                    <li>Form auto-fill information</li>
                  </ul>
                </div>

                <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Google Ads</li>
                    <li>Retargeting and remarketing</li>
                    <li>Conversion tracking</li>
                    <li>Social media integration</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-4">
                  We work with trusted third-party services that may set their own cookies:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-gray-800">Analytics:</strong>
                      <ul className="list-disc pl-4 text-gray-700 mt-1">
                        <li>Google Analytics</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gray-800">Marketing:</strong>
                      <ul className="list-disc pl-4 text-gray-700 mt-1">
                        <li>Google Ads</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gray-800">Functionality:</strong>
                      <ul className="list-disc pl-4 text-gray-700 mt-1">
                        <li>Stripe (payments)</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-gray-800">Social Media:</strong>
                      <ul className="list-disc pl-4 text-gray-700 mt-1">
                        <li>Facebook</li>
                        <li>Twitter</li>
                        <li>LinkedIn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cookie Consent Banner</h3>
                <p className="text-gray-700 mb-4">
                  When you first visit our website, you'll see a cookie consent banner where you can:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-6">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your preferences by category</li>
                  <li>Learn more about each cookie type</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">Browser Settings</h3>
                <p className="text-gray-700 mb-4">
                  You can also manage cookies through your browser settings:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-gray-800">Chrome:</strong>
                      <p className="text-gray-700">Settings → Privacy and Security → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-gray-800">Firefox:</strong>
                      <p className="text-gray-700">Options → Privacy & Security → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-gray-800">Safari:</strong>
                      <p className="text-gray-700">Preferences → Privacy → Cookies</p>
                    </div>
                    <div>
                      <strong className="text-gray-800">Edge:</strong>
                      <p className="text-gray-700">Settings → Cookies and Site Permissions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website 
                    and limit your ability to use some features.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-4">
                  Different cookies have different lifespans:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain until expiry date or manual deletion</li>
                  <li><strong>Analytics cookies:</strong> Typically expire after 2 years</li>
                  <li><strong>Marketing cookies:</strong> Usually expire after 30-90 days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">
                  We may update this cookie policy from time to time to reflect changes in our practices 
                  or for legal reasons. We will notify you of any significant changes by updating the 
                  "last updated" date at the top of this policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 mb-4">
                  If you have questions about our use of cookies:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-gray-700">
                    <strong>Email:</strong> support@myapproved.com
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            This cookie policy was last updated in June 2026.
          </div>
        </div>
        </Container>
      </Section>
    </div>
  );
}
