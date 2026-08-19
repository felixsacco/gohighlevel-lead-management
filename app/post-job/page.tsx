import { generateMetadata } from '@/lib/seo';
import { Briefcase, Users, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import AIQuoteTriggerButton from '@/components/AIQuoteTriggerButton';

export const metadata = generateMetadata('postJob', {
  title: 'Post a Job | MyApproved - Find Tradespeople for Your Project',
  description: 'Post your job and get quotes from verified tradespeople. Free to post, easy to manage, and find the perfect professional for your project.',
  keywords: ['post job', 'hire tradespeople', 'find professionals', 'job posting', 'tradesperson hiring'],
  canonical: 'https://myapproved.com/post-job'
});

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-900 text-white pb-20 pt-8 sm:pt-12">
        <Container size="wide" className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium text-yellow-400 mb-6">
            <Briefcase className="w-4 h-4" />
            Find Perfect Tradespeople
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
            Post Your Job
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with skilled tradespeople in your area. Describe your job and receive free, competitive quotes.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-blue-200 mb-10 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free to post</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Identity-checked tradespeople</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>Quotes in minutes</span>
            </div>
          </div>

          <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:brightness-95 text-blue-900 font-bold px-10 py-5 text-xl rounded-xl transition-colors shadow-lg">
            Get Free Quotes Now
            <ArrowRight className="w-5 h-5" />
          </AIQuoteTriggerButton>
          <p className="mt-4 text-blue-300 text-sm">Takes 2 minutes · No obligation · Completely free</p>
        </Container>
      </section>

      {/* How it works */}
      <Section>
        <Container size="wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Three simple steps to find your perfect tradesperson</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Describe Your Job",
                desc: "Tell us what work you need done, where you are, and when you need it completed.",
              },
              {
                step: "2",
                title: "Receive Free Quotes",
                desc: "Up to 5 tradespeople will respond with competitive quotes for your job.",
              },
              {
                step: "3",
                title: "Hire with Confidence",
                desc: "Compare profiles, reviews, and prices — then choose the tradesperson that's right for you.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#1A3A8A] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <AIQuoteTriggerButton className="inline-flex items-center justify-center gap-2 bg-[#1A3A8A] hover:bg-blue-800 text-white font-bold px-8 py-4 text-base rounded-xl transition-colors">
              Start Your Free Quote
              <ArrowRight className="w-4 h-4" />
            </AIQuoteTriggerButton>
          </div>
        </Container>
      </Section>

      {/* Benefits */}
      <Section className="bg-gray-50">
        <Container size="wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Post on MyApproved?</h2>
            <p className="text-gray-500">Join thousands of satisfied customers who found their perfect tradesperson</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Checked Professionals',
                description: 'Every tradesperson passes identity, business and insurance checks before listing',
              },
              {
                icon: Users,
                title: 'Multiple Quotes',
                description: 'Receive up to 5 competitive quotes to compare prices and services',
              },
              {
                icon: CheckCircle,
                title: 'No Upfront Costs',
                description: 'Posting jobs is completely free with no hidden charges or fees',
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <benefit.icon className="w-12 h-12 text-[#1A3A8A] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
