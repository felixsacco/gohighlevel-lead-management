import React, { useState } from "react";

const TABS = [
  {
    label: "Popular Jobs",
    aria: "Popular Jobs",
    jobs: [
      ["Electricians in London", "Roofers in Edinburgh", "Gardeners in Wolverhampton"],
      ["Electricians in Cardiff", "Plumbers in Liverpool", "Plumbers in Croydon"],
      ["Roofers in Plymouth", "Plumbers in Norwich", "Gardeners in Luton"],
      ["Plumbers in Birmingham", "Roofers in Belfast", "Gutter Cleaning Services in Manchester"],
    ],
  },
  {
    label: "Find Tradespeople",
    aria: "Find Tradespeople",
    jobs: [
      ["Find Electricians", "Find Plumbers", "Find Roofers"],
      ["Find Gardeners", "Find Carpenters", "Find Cleaners"],
      ["Find Handymen", "Find Decorators", "Find Tilers"],
      ["Find HVAC", "Find Pest Control", "Find More"]
    ],
  },
  {
    label: "Find Out More",
    aria: "Find Out More",
    jobs: [
      ["How It Works", "FAQ", "About Us"],
      ["Contact", "Careers", "Blog"],
      ["Privacy Policy", "Terms of Service", "Help Center"],
      ["Partnerships", "Press", "Sitemap"]
    ],
  },
];

export default function TabsSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div
        className="flex space-x-8 border-b-2 mb-10"
        role="tablist"
        aria-label="Popular jobs navigation"
      >
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={`outline-none focus:ring-2 focus:ring-yellow-400 focus:z-10 px-4 pb-3 text-lg font-semibold rounded-t-xl shadow transition-all duration-200 ${
              activeTab === idx
                ? "text-blue-900 font-extrabold border-b-4 border-yellow-400 bg-white"
                : "text-gray-500 hover:text-blue-900 hover:border-yellow-400 border-b-4 border-transparent bg-white"
            }`}
            role="tab"
            aria-selected={activeTab === idx}
            aria-controls={`tabpanel-${idx}`}
            id={`tab-${idx}`}
            tabIndex={activeTab === idx ? 0 : -1}
            onClick={() => setActiveTab(idx)}
            onKeyDown={e => {
              if (e.key === "ArrowRight") setActiveTab((activeTab + 1) % TABS.length);
              if (e.key === "ArrowLeft") setActiveTab((activeTab - 1 + TABS.length) % TABS.length);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        role="tabpanel"
      >
        {TABS[activeTab].jobs.map((col, colIdx) => (
          <div
            key={colIdx}
            className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-yellow-400"
            tabIndex={0}
            aria-label={`${TABS[activeTab].label} column ${colIdx + 1}`}
          >
            {col.map((job, jobIdx) => (
              <span
                key={jobIdx}
                className={`$${jobIdx === 0 ? 'font-bold text-blue-900 mb-1' : 'text-blue-700'} cursor-pointer transition-colors duration-150 hover:text-yellow-500 focus:text-yellow-500`}
                tabIndex={0}
                aria-label={job}
              >
                {job}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
