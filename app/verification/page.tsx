import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Award, 
  UserCheck, 
  CreditCard, 
  Clock, 
  Star,
  ArrowRight,
  Home,
  ChevronRight,
  Badge,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'How We Verify Tradespeople - MyApproved',
  description: 'Learn about our verification process: how tradespeople are identity checked and their public liability insurance confirmed and monitored.',
};

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-gray-200">
        <Container size="wide">
          <div className="flex items-center space-x-2 py-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>How We Verify Tradespeople</span>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-900 text-white pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-yellow-400 mb-6">
              <Shield className="w-4 h-4" />
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              How It Works
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-yellow-200 bg-clip-text text-transparent">
              How We Verify Tradespeople
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Our verification process confirms identity and public liability insurance, so you know who you are hiring.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Identity Checked</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>Public Liability Insurance Confirmed and Monitored</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Companies House Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <Section>
        <Container size="wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How We Verify Tradespeople
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tradespeople have their identity checked and their public liability insurance confirmed and monitored.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Identity */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-xl text-gray-900">Identity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We confirm who the tradesperson is before they can list.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Identity checked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Photo ID verified against a live selfie</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Address confirmed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Right to work in the UK confirmed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Screened against UK and international sanctions lists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-xl text-gray-900">Business</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  For limited companies we confirm the business is active at Companies House. Sole traders are verified by a different route.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Companies House verified</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Company number [X], active at Companies House</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Confirmed as a director of the business</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Registered as a sole trader, tax reference confirmed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-xl text-gray-900">Insurance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We confirm the cover type and the limit held, and monitor it throughout the tradesperson&apos;s time on the platform.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Public liability insurance confirmed and monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Public liability cover of £[X]m, confirmed and monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Employer&apos;s liability insurance of £[X]m confirmed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Insurer confirmed as FCA authorised</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cover is monitored and the listing is withdrawn if it lapses</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Trade certification */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-xl text-gray-900">Trade Certification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Where work requires a registration, we confirm it and show the registration number.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Gas Safe registered, number [X]</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>F-Gas certified, company and engineer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Part P registered electrician, [scheme name], number [X]</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>[FENSA or CERTASS] registered, number [X]</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>OFTEC registered, number [X]</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>WaterSafe approved contractor</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Ongoing monitoring */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-xl text-gray-900">Ongoing Monitoring</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Verification is kept up to date, with each check re-confirmed on its own schedule rather than treated as a one-off.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Companies House status is re-checked monthly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Trade registrations are re-checked quarterly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Insurance expiry is tracked and cover is re-confirmed at renewal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Identity is re-verified every three years</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Verification is withdrawn automatically when cover or certification lapses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>A member whose company is dissolved is suspended immediately</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* What we do not check */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <CardTitle className="text-xl text-gray-900">What We Do Not Check</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We do not claim more than the checks described here.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>We do not run background or criminal record checks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>We do not guarantee the work</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>We are not accredited by any body</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>Reference checks are not run</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>No interview step exists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-gray-500 text-center mt-8 max-w-3xl mx-auto">
            The full list of what is and is not checked is stated in plain English on the <Link href="/verified" className="text-blue-600 hover:underline">Verified</Link> page. A claim of registration always shows the registration number where one is issued.
          </p>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Container size="wide" className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Find Tradespeople?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Hire with confidence knowing each tradesperson&apos;s identity is checked and their public liability insurance is confirmed and monitored.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold">
              <Link href="/find-tradespeople">
                Find Tradespeople
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/instant-quote">
                Get Instant Quote
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
