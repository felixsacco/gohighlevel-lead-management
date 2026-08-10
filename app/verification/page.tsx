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
  description: 'Learn about our comprehensive verification process that ensures all tradespeople are identity-checked, qualified, and insured before joining our platform.',
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
              Trust & Safety First
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-yellow-200 bg-clip-text text-transparent">
              How We Verify Tradespeople
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Our rigorous 7-step verification process ensures every tradesperson on our platform is qualified, insured, and trustworthy.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>100% Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>Background Checked</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Qualified Professionals</span>
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
              Our 7-Step Verification Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every tradesperson goes through our comprehensive verification process before they can accept jobs on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <CardTitle className="text-xl text-gray-900">Identity Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Government ID Check</span>
                </div>
                <p className="text-gray-600 mb-4">
                  We verify identity using government-issued photo ID and cross-reference with official databases.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Photo ID verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Address confirmation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Phone number verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <CardTitle className="text-xl text-gray-900">Background Check</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Criminal Record Check</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive background screening including DBS checks and criminal record verification.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>DBS certificate required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Criminal record screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Reference verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <CardTitle className="text-xl text-gray-900">Qualification Check</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Professional Certifications</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Verification of professional qualifications, certifications, and trade-specific credentials.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Trade certifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional memberships</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Skills assessment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <CardTitle className="text-xl text-gray-900">Insurance Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-900">Public Liability Insurance</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive insurance verification including public liability and professional indemnity coverage.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Public liability insurance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional indemnity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Policy validity check</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <CardTitle className="text-xl text-gray-900">Portfolio Review</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-red-600" />
                  <span className="font-semibold text-gray-900">Work Quality Assessment</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Review of previous work, customer testimonials, and portfolio to ensure quality standards.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Previous work samples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Customer testimonials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Quality standards check</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 6 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    6
                  </div>
                  <CardTitle className="text-xl text-gray-900">Interview Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <span className="font-semibold text-gray-900">Video Interview</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Face-to-face video interview to assess communication skills, professionalism, and trade knowledge.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional communication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Trade knowledge assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Customer service skills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 7 */}
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    7
                  </div>
                  <CardTitle className="text-xl text-gray-900">Final Approval</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Platform Access</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Final review and approval by our verification team before granting platform access.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Final team review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Platform onboarding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ongoing monitoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Container size="wide" className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Find Verified Tradespeople?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the peace of mind that comes with working with fully verified, insured, and qualified professionals.
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
