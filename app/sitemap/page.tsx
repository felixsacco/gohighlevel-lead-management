import Link from "next/link";
import {
  Home, Search, Users, Info, FileText, MapPin, Wrench,
  Zap, Flame, Hammer, Leaf, Shield, BookOpen, Star,
} from "lucide-react";

export const metadata = {
  title: "Sitemap | MyApproved",
  description: "Browse every page on MyApproved - find tradespeople, read guides, manage your account, or explore our legal policies.",
  alternates: { canonical: "https://myapproved.com/sitemap" },
};

const sections = [
  {
    title: "Main Pages",
    icon: Home,
    pages: [
      { name: "Home", href: "/", desc: "Find verified tradespeople across the UK" },
      { name: "Find Tradespeople", href: "/find-tradespeople", desc: "Browse and search verified professionals" },
      { name: "Instant Quote", href: "/instant-quote", desc: "Get instant quotes from approved tradespeople" },
      { name: "Post a Job", href: "/post-job", desc: "Describe your job and receive competitive quotes" },
      { name: "Locations", href: "/locations", desc: "Browse tradespeople by UK region or city" },
    ],
  },
  {
    title: "Building & Renovation",
    icon: Hammer,
    pages: [
      { name: "Builders", href: "/builder", desc: "Hire experienced builders and contractors" },
      { name: "Roofers", href: "/roofer", desc: "Roof repairs, replacements, and guttering" },
      { name: "Plasterers", href: "/plasterer", desc: "Plastering and rendering services" },
      { name: "Carpenters", href: "/carpenter", desc: "Joinery, doors, and woodwork" },
      { name: "Painters & Decorators", href: "/painter-decorator", desc: "Interior and exterior painting" },
      { name: "Kitchen Fitters", href: "/kitchen-fitter", desc: "Kitchen installation and fitting" },
      { name: "Bathroom Fitters", href: "/bathroom-fitter", desc: "Bathroom installation and renovation" },
      { name: "Tilers", href: "/tiler", desc: "Floor and wall tiling services" },
      { name: "Flooring Specialists", href: "/flooring", desc: "Flooring supply and installation" },
      { name: "Loft Conversion Specialists", href: "/loft-conversion", desc: "Loft conversions and attic rooms" },
      { name: "Conservatory Builders", href: "/conservatory", desc: "Conservatory installation and repairs" },
      { name: "Scaffolders", href: "/scaffolder", desc: "Scaffolding hire and erection" },
    ],
  },
  {
    title: "Plumbing, Heating & Electrical",
    icon: Flame,
    pages: [
      { name: "Plumbers", href: "/plumber", desc: "Find qualified plumbers near you" },
      { name: "Electricians", href: "/electrician", desc: "Connect with certified electricians" },
      { name: "Gas Engineers", href: "/gas-engineer", desc: "Boiler servicing, repairs, and installations" },
      { name: "Heating Engineers", href: "/heating-engineer", desc: "Central heating and boiler specialists" },
      { name: "Air Conditioning Engineers", href: "/air-conditioning", desc: "AC installation, servicing, and repair" },
      { name: "Loft Insulation Specialists", href: "/loft-insulation", desc: "Insulation installation and upgrades" },
      { name: "Solar Panel Installers", href: "/solar-panel-installer", desc: "Solar PV installation and maintenance" },
    ],
  },
  {
    title: "Home & Garden Services",
    icon: Leaf,
    pages: [
      { name: "Handymen", href: "/handyman", desc: "General repairs and odd jobs" },
      { name: "Cleaners", href: "/cleaner", desc: "Domestic and commercial cleaning" },
      { name: "Carpet Cleaners", href: "/carpet-cleaner", desc: "Professional carpet and upholstery cleaning" },
      { name: "Gardeners", href: "/gardener", desc: "Garden maintenance and lawn care" },
      { name: "Landscapers", href: "/landscaper", desc: "Garden design and landscaping" },
      { name: "Fencers", href: "/fencer", desc: "Fencing installation and repairs" },
      { name: "Driveway Specialists", href: "/driveway-specialist", desc: "Driveways, patios, and block paving" },
      { name: "Window Fitters", href: "/window-fitter", desc: "Window and door installation" },
    ],
  },
  {
    title: "Specialist Services",
    icon: Shield,
    pages: [
      { name: "Locksmiths", href: "/locksmith", desc: "Lock fitting, repair, and emergency lockout" },
      { name: "Security Installers", href: "/security-installer", desc: "Alarms, CCTV, and access control" },
      { name: "Pest Control", href: "/pest-control", desc: "Pest removal and prevention" },
      { name: "Damp Specialists", href: "/damp-specialist", desc: "Damp proofing and treatment" },
      { name: "Chimney Sweeps", href: "/chimney-sweep", desc: "Chimney sweeping and inspections" },
      { name: "Waste Removal", href: "/waste-removal", desc: "Rubbish clearance and skip hire" },
    ],
  },
  {
    title: "Find by Trade & City",
    icon: Search,
    pages: [
      { name: "Plumbers Near Me", href: "/find-tradespeople/plumber", desc: "Find plumbers across the UK" },
      { name: "Electricians Near Me", href: "/find-tradespeople/electrician", desc: "Find electricians across the UK" },
      { name: "Builders Near Me", href: "/find-tradespeople/builder", desc: "Find builders across the UK" },
      { name: "Gas Engineers Near Me", href: "/find-tradespeople/gas-engineer", desc: "Find Gas Safe engineers near you" },
      { name: "Roofers Near Me", href: "/find-tradespeople/roofer", desc: "Find roofers across the UK" },
      { name: "Heating Engineers Near Me", href: "/find-tradespeople/heating-engineer", desc: "Find heating engineers near you" },
      { name: "Plasterers Near Me", href: "/find-tradespeople/plasterer", desc: "Find plasterers across the UK" },
      { name: "Carpenters Near Me", href: "/find-tradespeople/carpenter", desc: "Find carpenters across the UK" },
      { name: "Painters Near Me", href: "/find-tradespeople/painter-decorator", desc: "Find decorators across the UK" },
      { name: "Handymen Near Me", href: "/find-tradespeople/handyman", desc: "Find handymen across the UK" },
    ],
  },
  {
    title: "Blog & Guides",
    icon: BookOpen,
    pages: [
      { name: "All Articles", href: "/blog", desc: "Tips, guides, and trade advice" },
      { name: "How Much Does a Plumber Cost?", href: "/blog/how-much-does-a-plumber-cost-london", desc: "Plumber costs in London and the UK" },
      { name: "Finding the Best Electrician", href: "/blog/best-electrician-manchester", desc: "How to find a trusted electrician" },
      { name: "Common Boiler Problems in Winter", href: "/blog/common-boiler-problems-winter", desc: "Diagnose and fix boiler faults" },
    ],
  },
  {
    title: "Company",
    icon: Info,
    pages: [
      { name: "About Us", href: "/about", desc: "Our mission and how we work" },
      { name: "How It Works", href: "/how-it-works", desc: "The MyApproved process explained" },
      { name: "For Tradespeople", href: "/for-tradespeople", desc: "Grow your business with MyApproved" },
      { name: "Tradesperson Verification", href: "/verification", desc: "How we verify every tradesperson" },
      { name: "FAQ", href: "/faq", desc: "Frequently asked questions" },
      { name: "Contact", href: "/contact", desc: "Get in touch with our team" },
      { name: "Help Centre", href: "/help", desc: "Support articles and guides" },
    ],
  },
  {
    title: "Account",
    icon: Users,
    pages: [
      { name: "Register as a Homeowner", href: "/register/client", desc: "Sign up to find tradespeople" },
      { name: "Register as a Tradesperson", href: "/register/tradesperson", desc: "Join the platform and grow your business" },
      { name: "Homeowner Login", href: "/login/client", desc: "Access your homeowner account" },
      { name: "Tradesperson Login", href: "/login/trade", desc: "Access your tradesperson account" },
    ],
  },
  {
    title: "Legal",
    icon: FileText,
    pages: [
      { name: "Privacy Policy", href: "/privacy", desc: "How we collect, use, and protect your data" },
      { name: "Terms & Conditions", href: "/terms", desc: "Platform terms of use" },
      { name: "Cookie Policy", href: "/cookies", desc: "How we use cookies" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Sitemap</h1>
          <p className="text-blue-200 text-lg">
            Every page on MyApproved, organised for easy navigation.
          </p>
          <p className="text-blue-300 text-sm mt-4">
            Looking for our XML sitemap?{" "}
            <a href="/sitemap.xml" className="underline hover:text-white transition-colors">
              View sitemap.xml
            </a>
          </p>
        </div>
      </section>

      {/* Sitemap grid */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-extrabold text-brand-navy">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.pages.map((page) => (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className="group flex flex-col hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                      >
                        <span className="text-sm font-semibold text-brand-navy group-hover:text-brand-amber transition-colors">
                          {page.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">{page.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
