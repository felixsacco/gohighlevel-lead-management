"use client";

import { useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle, Clock, Shield } from "lucide-react";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": "https://myapproved.com/contact",
            "url": "https://myapproved.com/contact",
            "name": "Contact MyApproved",
            "mainEntity": {
              "@type": "Organization",
              "name": "MyApproved",
              "email": "support@myapproved.com",
              "url": "https://myapproved.com",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-navyDark to-brand-navy text-white overflow-hidden min-h-[100vh] flex items-center -mt-[var(--header-height)]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[160px] sm:pt-[176px] pb-24 md:pt-[224px] md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <SectionHeaderPill>Get in Touch</SectionHeaderPill>
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] mb-12 sm:mb-16 px-2 sm:px-4 text-white" style={{fontWeight: 800}}>Contact Us</h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Have a question or need support? Send us a message and we'll get back to you within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Email",
                detail: "support@myapproved.com",
                sub: "We reply within one business day",
              },
              {
                icon: Clock,
                title: "Support Hours",
                detail: "Mon - Fri, 9am - 6pm",
                sub: "UK time (GMT / BST)",
              },
              {
                icon: Shield,
                title: "Verified & Secure",
                detail: "GDPR compliant",
                sub: "Your data is always protected",
              },
            ].map(({ icon: Icon, title, detail, sub }) => (
              <div key={title} className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>{title}</p>
                  <p className="text-gray-600 font-medium text-sm">{detail}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-[#F1F5F9] py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>Message Sent</h2>
              <p className="text-gray-600">Thanks for reaching out. We'll reply to <strong>{form.email}</strong> within one business day.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 lg:p-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-navy mb-1" style={{fontWeight: 800}}>Send a Message</h2>
              <p className="text-gray-600 text-sm mb-8">All fields marked * are required.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                    <input
                      required
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                    <input
                      required
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option>General Enquiry</option>
                    <option>Technical Support</option>
                    <option>Tradesperson Application</option>
                    <option>Billing Question</option>
                    <option>Complaint</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  style={{fontWeight: 800}}
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-navy py-12 sm:py-16 md:py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 text-white" style={{fontWeight: 800}}>Looking for quick answers?</h2>
          <p className="text-white/75 text-sm mb-6">Our help centre covers the most common questions for homeowners and tradespeople.</p>
          <a href="/help" className="inline-block bg-brand-amber hover:bg-brand-amberDark text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Visit Help Centre
          </a>
        </div>
      </section>
    </>
  );
}
