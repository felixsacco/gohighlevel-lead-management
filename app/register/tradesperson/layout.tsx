import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Register as a Tradesperson | Join MyApproved UK - Free to Start",
  description: "Create your verified tradesperson profile on MyApproved. Get quality local leads, showcase your qualifications, and grow your trade business across the UK. Free to register.",
  keywords: "register tradesperson UK, join trades directory, tradesman signup, verified contractor registration, MyApproved tradesperson",
  alternates: { canonical: "https://myapproved.com/register/tradesperson" },
  openGraph: {
    title: "Register as a Tradesperson | MyApproved UK",
    description: "Join the UK's fastest-growing verified tradespeople platform. Get quality leads, build your reputation, and grow your business - free to register.",
    url: "https://myapproved.com/register/tradesperson",
    siteName: "MyApproved",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RegisterTradespersonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
