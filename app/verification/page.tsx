import React from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  Award,
  UserCheck,
  CreditCard,
  ArrowRight,
  Home,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'How We Verify Tradespeople - MyApproved',
  description: 'Every tradesperson passes four checks before listing: photo ID, registered business on Companies House, public liability insurance, and qualifications.',
};

const checks = [
  {
    icon: UserCheck,
    title: 'Photo ID',
    body: 'We confirm who the tradesperson is before they can list.',
    points: [
      'Identity checked against a photo ID',
      'Right to work in the UK confirmed',
    ],
  },
  {
    icon: Shield,
    title: 'Registered Business',
    body: 'We confirm the business is real and active on Companies House.',
    points: [
      'Business reviewed on Companies House',
      'Confirmed as a director of the business',
    ],
  },
  {
    icon: CreditCard,
    title: 'Public Liability Insurance',
    body: 'We confirm the cover is real and in date, and monitor it throughout.',
    points: [
      'Insurance confirmed real and in date',
      'Insurer confirmed as FCA authorised',
      'Cover monitored and the listing is withdrawn if it lapses',
    ],
  },
  {
    icon: Award,
    title: 'Qualifications',
    body: 'Where work requires a registration, we confirm it and show the registration number.',
    points: [
      'Trade qualifications reviewed',
      'Registration number shown where one is issued',
    ],
  },
];

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
      <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-[#0A2463] text-white pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-amber/10 px-4 py-2 rounded-full text-sm font-medium text-brand-amber mb-6">
              <Shield className="w-4 h-4" />
              How It Works
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
              How We Verify Tradespeople
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Every tradesperson passes four checks before they can appear: photo ID, registered business on Companies House, public liability insurance, and qualifications.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                <span>Identity Checked</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <CreditCard className="w-4 h-4 text-brand-amber" />
                <span>Public Liability Insurance Confirmed and Monitored</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full">
                <BadgeCheck className="w-4 h-4 text-brand-amber" />
                <span>Companies House Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Checks */}
      <Section>
        <Container size="wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy mb-4">
              Four Checks Before You Hire
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We confirm the insurance is real and in date, and monitor it so the listing is withdrawn if it lapses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {checks.map(({ icon: Icon, title, body, points }) => (
              <Card key={title} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-amber"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-brand-amber" />
                    <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{body}</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-gray-600 text-center mt-10 max-w-3xl mx-auto">
            A claim of registration always shows the registration number where one is issued.
          </p>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-brand-navy to-[#0A2463] text-white">
        <Container size="wide" className="text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
            Ready to Find Tradespeople?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Hire with confidence knowing each tradesperson passes four checks before they can appear on the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-amber hover:bg-[#E0A100] text-black font-bold">
              <Link href="/find-tradespeople">
                Find Tradespeople
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-brand-navy">
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
