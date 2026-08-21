"use client";

import { Mail } from "lucide-react";
import { ShieldCheck as ShieldCheckFill, SealCheck as SealCheckFill } from "@phosphor-icons/react";

export default function HelpTrustBadges() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy" style={{fontWeight: 800}}>Email Support</p>
          <a href="mailto:support@myapproved.com" className="text-brand-navy text-sm font-medium">support@myapproved.com</a>
          <p className="text-gray-600 text-xs mt-0.5">Reply within one business day</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheckFill weight="fill" className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy notranslate" style={{fontWeight: 800}}>IDENTITY CHECKED</p>
          <p className="text-gray-600 text-sm">Photo ID verified against a live selfie</p>
          <p className="text-gray-600 text-xs mt-0.5">Business confirmed on Companies House</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shrink-0">
          <SealCheckFill weight="fill" className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base sm:text-lg md:text-xl font-extrabold text-brand-navy notranslate" style={{fontWeight: 800}}>INSURANCE VERIFIED</p>
          <p className="text-gray-600 text-sm">Public liability cover confirmed and monitored</p>
          <p className="text-gray-600 text-xs mt-0.5">Free to search and compare</p>
        </div>
      </div>
    </div>
  );
}
