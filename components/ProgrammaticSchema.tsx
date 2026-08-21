/**
 * ProgrammaticSchema - hyper-local, trade-specific JSON-LD injector.
 *
 * Renders five structured-data blocks per page:
 *   1. LocalBusiness / trade-specific Schema.org sub-type  (with AggregateRating)
 *   2. FAQPage  - 4 high-intent Q&A pairs per trade
 *   3. BreadcrumbList - 4-level depth
 *   4. Service - nested areaServed to neighborhood level
 *   5. Review - individual review sample for rich snippet eligibility
 *
 * No "use client" - works in Server and Client components.
 */

// ── Schema.org type map ──────────────────────────────────────────────────────
const TRADE_SCHEMA_TYPE: Record<string, string> = {
  plumber:                 "PlumbingService",
  electrician:             "Electrician",
  "gas-engineer":          "HVACBusiness",
  "heating-engineer":      "HVACBusiness",
  "air-conditioning":      "HVACBusiness",
  builder:                 "GeneralContractor",
  roofer:                  "RoofingContractor",
  carpenter:               "HomeAndConstructionBusiness",
  "kitchen-fitter":        "HomeAndConstructionBusiness",
  "bathroom-fitter":       "PlumbingService",
  plasterer:               "HomeAndConstructionBusiness",
  tiler:                   "HomeAndConstructionBusiness",
  flooring:                "HomeAndConstructionBusiness",
  painter:                 "HousePainter",
  "painter-decorator":     "HousePainter",
  handyman:                "LocalBusiness",
  locksmith:               "Locksmith",
  landscaper:              "LandscapingService",
  gardener:                "LandscapingService",
  "window-fitter":         "HomeAndConstructionBusiness",
  "damp-specialist":       "HomeAndConstructionBusiness",
  scaffolder:              "HomeAndConstructionBusiness",
  "chimney-sweep":         "HomeAndConstructionBusiness",
  "solar-panel-installer": "LocalBusiness",
  "loft-conversion":       "GeneralContractor",
  conservatory:            "GeneralContractor",
  "driveway-specialist":   "HomeAndConstructionBusiness",
  fencer:                  "HomeAndConstructionBusiness",
  "pest-control":          "LocalBusiness",
  "security-installer":    "LocalBusiness",
  "waste-removal":         "LocalBusiness",
  "carpet-cleaner":        "LocalBusiness",
  "loft-insulation":       "HomeAndConstructionBusiness",
  cleaner:                 "LocalBusiness",
};

// ── Trade price ranges for structured data ───────────────────────────────────
const TRADE_PRICE: Record<string, { low: string; high: string; unit: string }> = {
  plumber:              { low: "40",  high: "70",   unit: "GBP" },
  electrician:          { low: "45",  high: "75",   unit: "GBP" },
  "gas-engineer":       { low: "60",  high: "100",  unit: "GBP" },
  "heating-engineer":   { low: "50",  high: "80",   unit: "GBP" },
  builder:              { low: "35",  high: "60",   unit: "GBP" },
  roofer:               { low: "35",  high: "55",   unit: "GBP" },
  carpenter:            { low: "35",  high: "55",   unit: "GBP" },
  plasterer:            { low: "30",  high: "50",   unit: "GBP" },
  "painter-decorator":  { low: "25",  high: "45",   unit: "GBP" },
  painter:              { low: "25",  high: "45",   unit: "GBP" },
  handyman:             { low: "25",  high: "40",   unit: "GBP" },
  locksmith:            { low: "60",  high: "120",  unit: "GBP" },
  landscaper:           { low: "30",  high: "50",   unit: "GBP" },
  gardener:             { low: "25",  high: "40",   unit: "GBP" },
  "bathroom-fitter":    { low: "35",  high: "55",   unit: "GBP" },
  "kitchen-fitter":     { low: "35",  high: "55",   unit: "GBP" },
  tiler:                { low: "30",  high: "50",   unit: "GBP" },
  cleaner:              { low: "15",  high: "25",   unit: "GBP" },
};

// ── Expanded trade-specific FAQ pairs (4 per trade) ──────────────────────────
const TRADE_FAQS: Record<string, Array<{ q: string; a: string }>> = {
  plumber: [
    {
      q: "How much does a plumber cost near me?",
      a: "Plumbers near you typically charge £40–£70 per hour with call-out fees of £50–£100. Emergency plumbers cost £80–£150 per hour. Most standard jobs - leak repairs, tap replacement, toilet fitting - cost £150–£400 all-in. All plumbers on MyApproved provide upfront fixed-price quotes before work starts.",
    },
    {
      q: "How do I find a local plumber in my area?",
      a: "Use MyApproved to find a plumber near you. Every plumber listed has their identity checked and their public liability insurance confirmed and monitored. Post your job free and receive quotes within hours.",
    },
    {
      q: "Are MyApproved plumbers Gas Safe registered?",
      a: "Gas work (boilers, gas appliances, central heating) on MyApproved is carried out by Gas Safe registered engineers. You can verify their 7-digit Gas Safe ID at gassaferegister.co.uk before work begins.",
    },
    {
      q: "What is the cheapest way to find a reliable plumber?",
      a: "MyApproved is free for homeowners - post your job and verified local plumbers who match it will call you back with a competitive quote, at no cost to you. You only pay the plumber for completed work. Comparing quotes saves homeowners an average of 15–25% vs. hiring the first plumber you find.",
    },
  ],
  electrician: [
    {
      q: "How much does an electrician cost near me?",
      a: "Electricians near you charge £45–£75 per hour. A fuse board replacement costs £350–£700; a full rewire of a 3-bed house runs £3,000–£5,500. All electrical work by MyApproved electricians is NICEIC or NAPIT certified with Part P building notification included at no extra charge.",
    },
    {
      q: "How do I find a qualified electrician in my area?",
      a: "MyApproved lists only NICEIC, NAPIT, or equivalent scheme-registered electricians. Every electrician has their identity checked and their public liability insurance confirmed and monitored before listing. Post your job free on MyApproved and get quotes from scheme-registered local electricians within hours.",
    },
    {
      q: "Do MyApproved electricians provide Part P certification?",
      a: "Yes. All notifiable electrical work is carried out by Part P registered electricians on MyApproved. They notify the relevant building control body on your behalf, giving you a completion certificate valid for insurance and property conveyancing.",
    },
    {
      q: "Is it safe to hire an electrician found online?",
      a: "It is safe when using a verification platform like MyApproved. Every electrician listed has their identity checked, their public liability insurance confirmed and monitored, and scheme registration checks (NICEIC, NAPIT, or equivalent). Reviews are left only by customers who completed a confirmed booking - not anonymous or fake.",
    },
  ],
  roofer: [
    {
      q: "How much does a roofer cost near me?",
      a: "Roofers near you charge £35–£55 per hour. Minor roof repairs cost £150–£500; major repairs £500–£2,000; a full re-roof averages £5,000–£12,000 for a typical semi-detached. All MyApproved roofers have their public liability insurance confirmed and monitored, and provide itemised written quotes.",
    },
    {
      q: "How do I find a reliable roofer in my area?",
      a: "MyApproved lists only roofers with real customer reviews. Every roofer has their identity checked and their public liability insurance confirmed and monitored before listing. Post your roofing job free and compare quotes from local roofers - no obligation to accept.",
    },
    {
      q: "Do MyApproved roofers have public liability insurance?",
      a: "Yes. Every roofer on MyApproved has their public liability insurance confirmed and monitored before they can accept bookings. Cover is reviewed as part of our ongoing tradesperson compliance process, and verification is withdrawn if cover lapses.",
    },
    {
      q: "What questions should I ask a roofer before hiring?",
      a: "Ask for: (1) proof of public liability insurance, (2) a detailed written quote with materials specified, (3) whether they're a member of the National Federation of Roofing Contractors (NFRC), (4) how waste materials will be disposed of, and (5) the expected timeline. All MyApproved roofers have their identity checked and their public liability insurance confirmed and monitored against these criteria.",
    },
  ],
  "gas-engineer": [
    {
      q: "How much does a Gas Safe engineer cost near me?",
      a: "Gas Safe registered engineers near you charge £60–£100 per hour. A boiler service costs £80–£120; a boiler repair £150–£600; a new boiler installation £1,500–£4,000. Landlord gas safety certificates (CP12) start from £60. All engineers on MyApproved are Gas Safe registered.",
    },
    {
      q: "How do I find a Gas Safe registered engineer near me?",
      a: "MyApproved verifies every gas engineer's Gas Safe registration number before they can list on the platform. Post your gas job free and receive quotes from registered local engineers. You can also verify any engineer's credentials at gassaferegister.co.uk using their 7-digit ID.",
    },
    {
      q: "How do I check if a gas engineer is Gas Safe registered?",
      a: "Ask to see their Gas Safe ID card - it lists the gas work categories they are licensed to carry out. Alternatively, enter their 7-digit registration number at gassaferegister.co.uk. It is illegal for an unregistered person to carry out gas work in a UK home.",
    },
    {
      q: "How often should I have my boiler serviced?",
      a: "Boilers should be serviced annually by a Gas Safe registered engineer. Regular servicing maintains efficiency, extends boiler life, keeps your warranty valid, and - most importantly - ensures carbon monoxide safety. MyApproved gas engineers offer fixed-price annual service packages starting from £80.",
    },
  ],
  builder: [
    {
      q: "How much does a local builder cost near me?",
      a: "Builders near you charge £35–£60 per hour or quote projects at a fixed price. Single-storey extensions cost £20,000–£45,000; double-storey £40,000–£80,000; loft conversions £30,000–£60,000. All builders on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are rated by local homeowners.",
    },
    {
      q: "How do I find a trustworthy builder in my area?",
      a: "MyApproved checks every builder's identity and confirms their public liability insurance before listing. Reviews are left only by homeowners who completed a confirmed project - not anonymous feedback. Post your building job free and compare quotes from local builders.",
    },
    {
      q: "Do I need planning permission for a home extension?",
      a: "Many single-storey rear extensions up to 4 metres (terraced/semi) or 8 metres (detached) fall under Permitted Development and require no planning permission. Loft conversions within volume limits are also usually permitted. Your MyApproved builder will advise on your specific project before quoting.",
    },
    {
      q: "What should a builder's quote include?",
      a: "A professional builder's quote should itemise: labour costs, materials with specifications and quantities, groundwork, waste removal, approximate timeline, and payment schedule. All MyApproved builders provide detailed written quotes - never accept a verbal estimate for work over £1,000.",
    },
  ],
  carpenter: [
    {
      q: "How much does a carpenter cost near me?",
      a: "Carpenters near you charge £35–£55 per hour. Standard jobs cost £200–£1,500; bespoke fitted wardrobes run £800–£3,500; kitchen fitting £1,000–£4,000; new staircase £3,000–£8,000. All carpenters on MyApproved have their identity checked, have their public liability insurance confirmed and monitored, and are reviewed by local homeowners.",
    },
    {
      q: "How do I find a reliable carpenter in my area?",
      a: "MyApproved lists only carpenters with real customer reviews. Post your carpentry job free and receive competitive quotes from qualified local carpenters. Every carpenter on MyApproved has their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "What is the difference between a carpenter and a joiner?",
      a: "A joiner typically works in a workshop crafting bespoke timber elements (doors, stairs, window frames). A carpenter fits those elements on-site. Many tradespeople on MyApproved are qualified in both disciplines and can handle complete projects from fabrication through to final installation.",
    },
    {
      q: "Do carpenters need to be qualified?",
      a: "While no licence is legally required, professional carpenters on MyApproved have their identity checked and their public liability insurance confirmed and monitored, ensuring technical competency across structural, first-fix, and second-fix carpentry work.",
    },
  ],
  locksmith: [
    {
      q: "How much does an emergency locksmith cost near me?",
      a: "Emergency locksmiths near you charge £60–£120 per hour. A daytime lockout typically costs £75–£150; evening and weekend lockouts £150–£250. Lock replacements average £80–£200 including parts. All locksmiths on MyApproved provide fixed upfront prices before starting work - no hidden callout fees.",
    },
    {
      q: "How do I find a reputable locksmith near me?",
      a: "Use MyApproved to find a local locksmith. Every locksmith listed has their identity checked, their public liability insurance confirmed and monitored, and is reviewed by real customers. Look for Master Locksmiths Association (MLA) membership as an additional quality indicator. Post your job free and receive quotes within minutes.",
    },
    {
      q: "What should I look for in a reputable locksmith?",
      a: "Look for: MLA membership, proof of public liability insurance, a written quote before work starts, and genuine customer reviews. Rogue locksmiths often advertise misleadingly low prices then charge far more on arrival. All locksmiths on MyApproved have their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "Can a locksmith open a door without breaking the lock?",
      a: "Yes, skilled locksmiths use non-destructive entry techniques - lock picking, bumping, or decoder tools - to open most modern locks without damage. A professional locksmith on MyApproved will always attempt non-destructive entry first and only drill if no other option exists, reducing replacement costs.",
    },
  ],
  plasterer: [
    {
      q: "How much does plastering cost near me?",
      a: "Plasterers near you charge £30–£50 per hour or £200–£600 per room for a skim coat. A full house re-plaster averages £2,500–£6,000. External rendering costs £40–£70 per square metre. All plasterers on MyApproved have their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "How do I find a good plasterer in my area?",
      a: "MyApproved lists plasterers with real customer reviews. Post your plastering job free and receive competitive quotes from local tradespeople. Every plasterer has their identity checked and their public liability insurance confirmed and monitored before listing on MyApproved.",
    },
    {
      q: "How long does plaster take to dry before painting?",
      a: "New plaster needs 4–6 weeks to dry fully before painting. A mist coat (approximately 70:30 paint to water) should be applied first to seal the surface and prevent paint from peeling. Your MyApproved plasterer will advise on exact drying times based on room conditions and plaster thickness.",
    },
    {
      q: "What is the difference between plastering and rendering?",
      a: "Plastering refers to applying a smooth finish coat to interior walls and ceilings. Rendering is the application of sand-cement or lime-based coatings to exterior walls for weather protection. Both require specialist skills; many plasterers on MyApproved are qualified in both.",
    },
  ],
  "painter-decorator": [
    {
      q: "How much does a painter and decorator cost near me?",
      a: "Painters and decorators near you charge £25–£45 per hour or quote £400–£1,200 per room including materials. A full 3-bed house exterior typically runs £2,000–£5,000. All decorators on MyApproved have their identity checked and their public liability insurance confirmed and monitored - free quotes available.",
    },
    {
      q: "How do I find a reliable painter and decorator in my area?",
      a: "MyApproved lists painters and decorators with genuine customer reviews. Post your decorating job free and compare quotes from local tradespeople. Every decorator listed has their identity checked and their public liability insurance confirmed and monitored before appearing on MyApproved.",
    },
    {
      q: "Do painters supply their own materials?",
      a: "Most painters and decorators on MyApproved can supply all materials as part of a fixed-price quote. Alternatively, they can work with customer-supplied paint. Materials and labour are always itemised separately in MyApproved quotes so you know exactly what you're paying for.",
    },
    {
      q: "How long does it take to decorate a room?",
      a: "A standard bedroom typically takes 1–2 days for a professional painter; a living room 2–3 days; a full house exterior 3–7 days depending on size and condition. Preparation (filling, sanding, priming) accounts for approximately 40% of the total time and is the key to a lasting finish.",
    },
  ],
  handyman: [
    {
      q: "How much does a handyman cost near me?",
      a: "Handymen near you charge £25–£40 per hour with a minimum call-out of 1–2 hours. Half-day rates run £80–£150; full-day rates £150–£280. All handymen on MyApproved have their public liability insurance confirmed and monitored and are reviewed by real local customers - no hidden fees.",
    },
    {
      q: "How do I find a trustworthy handyman near me?",
      a: "MyApproved lists handymen with genuine customer reviews. Every handyman has their identity checked and their public liability insurance confirmed and monitored before listing. Post your job free and receive quotes from local handymen - ideal for small jobs that don't require a specialist trade.",
    },
    {
      q: "What jobs can a handyman do?",
      a: "A handyman handles: flat-pack assembly, picture and mirror hanging, curtain rail and blind fitting, shelf installation, TV wall-mounting, minor plumbing (tap washers, toilet seats), door adjustments, fence repairs, and general home maintenance. They cannot carry out notifiable electrical or gas work - those require certified specialists.",
    },
    {
      q: "Is it worth hiring a handyman for small jobs?",
      a: "Yes - hiring a handyman for multiple small tasks in one visit is cost-effective and avoids the safety risks of DIY. MyApproved handymen can batch several jobs in a half-day visit for a flat rate of £80–£150, making them ideal for landlords and busy homeowners.",
    },
  ],
  cleaner: [
    {
      q: "How much does a professional cleaner cost near me?",
      a: "Professional cleaners near you charge £15–£25 per hour. A one-off deep clean costs £100–£300; end-of-tenancy cleans £150–£400 depending on property size. All cleaners on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local customers.",
    },
    {
      q: "How do I find a reliable cleaner near me?",
      a: "MyApproved lists cleaners with genuine customer reviews. Every cleaner has their identity checked and their public liability insurance confirmed and monitored before listing. Post your cleaning job free and receive quotes from local cleaners - regular or one-off.",
    },
    {
      q: "Are MyApproved cleaners identity checked?",
      a: "Every cleaner on MyApproved has their identity checked before listing. You can contact any cleaner directly to confirm cover before booking.",
    },
    {
      q: "What is included in an end of tenancy clean?",
      a: "A professional end-of-tenancy clean covers: all rooms (floors, skirting, walls, windows, light fittings), kitchen (appliances, cupboards inside and out, tiles, sink), bathroom (limescale removal, grout cleaning, fixtures), and any garden or outdoor areas specified in the tenancy. MyApproved cleaners provide a written checklist matched to your inventory.",
    },
  ],
  tiler: [
    {
      q: "How much does a tiler cost near me?",
      a: "Tilers near you charge £30–£50 per hour. Bathroom tiling costs £300–£800; kitchen splashback tiling runs £150–£400; floor tiling £30–£60 per square metre. All tilers on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local customers - free quotes available.",
    },
    {
      q: "How do I find a good tiler near me?",
      a: "MyApproved lists tilers with genuine customer reviews. Post your tiling job free and compare quotes from local tilers. Every tiler listed has their identity checked and their public liability insurance confirmed and monitored before appearing on the platform.",
    },
    {
      q: "How long does it take to tile a bathroom?",
      a: "Tiling a standard bathroom (approximately 15 square metres of walls) typically takes 2–3 days: day 1 for preparation and adhesive application, day 2 for tiling, day 3 for grouting and sealing. Larger or more complex bathrooms with natural stone or large-format tiles take longer. Your MyApproved tiler will provide an accurate timeline with your quote.",
    },
    {
      q: "Do I need to prepare walls before tiling?",
      a: "Yes. Walls must be clean, dry, flat, and structurally sound before tiling. Your MyApproved tiler will assess the substrate (plaster, plasterboard, or existing tiles) and advise on preparation required. Tiling over unstable or damp surfaces leads to tile failure - proper preparation is essential for a lasting finish.",
    },
  ],
  gardener: [
    {
      q: "How much does a gardener cost near me?",
      a: "Gardeners near you charge £25–£40 per hour. Regular garden maintenance visits cost £50–£120; a full garden clearance runs £150–£500. All gardeners on MyApproved are reviewed by real local customers and have their public liability insurance confirmed and monitored - free quotes available.",
    },
    {
      q: "How do I find a reliable gardener near me?",
      a: "MyApproved lists gardeners with genuine customer reviews. Post your gardening job free and receive quotes from local gardeners - regular maintenance, one-off clearances, or specialist work. Every gardener listed has their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "What is included in a regular garden maintenance visit?",
      a: "A standard maintenance visit typically covers: lawn mowing and edging, hedge trimming, border weeding, pruning of shrubs and roses, clearing debris, and seasonal planting. Your MyApproved gardener will agree a specific checklist with you on the first visit, tailored to your garden's needs.",
    },
    {
      q: "How often should a garden be professionally maintained?",
      a: "Most domestic gardens benefit from professional maintenance fortnightly during the growing season (April–September) and monthly during winter. Larger gardens or those with formal hedges may require weekly visits in summer. MyApproved gardeners offer flexible regular contracts - no long-term lock-in.",
    },
  ],
  "bathroom-fitter": [
    {
      q: "How much does a bathroom fitter cost near me?",
      a: "Bathroom fitters near you charge £35–£55 per hour. A full bathroom renovation typically costs £3,000–£10,000; an en-suite runs £2,000–£6,000. All bathroom fitters on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local customers - get a free quote today.",
    },
    {
      q: "How do I find a reliable bathroom fitter near me?",
      a: "MyApproved lists bathroom fitters with genuine customer reviews. Post your bathroom job free and compare quotes from local fitters. Every bathroom fitter listed has their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "How long does a bathroom renovation take?",
      a: "A full bathroom renovation by a MyApproved fitter typically takes 5–10 days: 1–2 days for stripping out, 1–2 days for plumbing and first-fix, 2–3 days for tiling, 1 day for sanitary ware installation, 1 day for finishing and sealing. More complex wet rooms or en-suites with underfloor heating may take 2 weeks.",
    },
    {
      q: "Do I need a plumber or a bathroom fitter?",
      a: "A bathroom fitter handles the full installation including tiles, sanitary ware, cabinets, and finishing. Many bathroom fitters on MyApproved hold plumbing qualifications and can complete the entire project. For complex plumbing routes or boiler connections, they coordinate with a specialist plumber - your MyApproved fitter will advise at the quoting stage.",
    },
  ],
  "kitchen-fitter": [
    {
      q: "How much does a kitchen fitter cost near me?",
      a: "Kitchen fitters near you charge £35–£55 per hour. Labour-only fitting typically costs £1,000–£5,000; a complete supply-and-fit kitchen runs £5,000–£20,000 depending on size and specification. All kitchen fitters on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local homeowners.",
    },
    {
      q: "How do I find a reliable kitchen fitter near me?",
      a: "MyApproved lists kitchen fitters with genuine customer reviews. Post your kitchen job free and receive quotes from local fitters. Every kitchen fitter listed has their identity checked and their public liability insurance confirmed and monitored before appearing on the platform.",
    },
    {
      q: "How long does kitchen fitting take?",
      a: "A standard 10-unit kitchen typically takes 3–5 days to fit: day 1 for stripping out and first-fix plumbing/electrics, days 2–3 for unit installation and worktop fitting, day 4 for tiling, day 5 for appliance connection, plinth, and cornices. Larger kitchens or bespoke designs may take 1–2 weeks.",
    },
    {
      q: "Do I need an electrician as well as a kitchen fitter?",
      a: "Most kitchen fitters on MyApproved can handle first-fix electrical work (socket relocation, appliance connections). For new circuits or consumer unit work, a Part P registered electrician is required. Your MyApproved kitchen fitter will identify what's needed in the quoting stage and can coordinate with other tradespeople.",
    },
  ],
  landscaper: [
    {
      q: "How much does a landscaper cost near me?",
      a: "Landscapers near you charge £30–£50 per hour. Patio installations cost £1,500–£6,000; full garden designs £3,000–£15,000. All landscapers on MyApproved are reviewed by real local homeowners and have their public liability insurance confirmed and monitored - free quotes available.",
    },
    {
      q: "How do I find a reliable landscaper near me?",
      a: "MyApproved lists landscapers with genuine customer reviews. Post your landscaping job free and compare quotes from local tradespeople. Every landscaper listed has their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "Do I need planning permission for a patio or decking?",
      a: "Patios at ground level generally do not need planning permission. Decking over 300mm high, covering more than 50% of the garden, or adjacent to a listed building may require permission. Your MyApproved landscaper will advise on planning requirements as part of the quoting process.",
    },
    {
      q: "What is the difference between a landscaper and a gardener?",
      a: "A landscaper designs and constructs outdoor spaces - patios, driveways, walls, water features, and planting schemes. A gardener maintains established gardens through regular upkeep. For a new garden design or hard landscaping project, book a landscaper; for ongoing maintenance, book a gardener. Many MyApproved tradespeople offer both services.",
    },
  ],
  "window-fitter": [
    {
      q: "How much does a window fitter cost near me?",
      a: "Window fitters near you charge £35–£55 per hour. A new UPVC window costs £400–£800 fitted; a full set for a 3-bed home runs £3,000–£8,000. All window fitters on MyApproved have their identity checked and their public liability insurance confirmed and monitored.",
    },
    {
      q: "How do I find a reliable window fitter near me?",
      a: "MyApproved lists only FENSA-registered or equivalent window fitters. Every installer has their identity checked and their public liability insurance confirmed and monitored, and is reviewed by real local customers. Post your window job free and compare quotes - you'll receive FENSA certificates on completion for insurance and conveyancing.",
    },
    {
      q: "Do I need a FENSA certificate for new windows?",
      a: "Yes. All replacement windows and doors in England and Wales must comply with Building Regulations Part L (energy efficiency) and Part N (safety glazing). FENSA-registered installers self-certify compliance and register with your local authority on your behalf. Your FENSA certificate is required when selling your property.",
    },
    {
      q: "How long do double glazed windows last?",
      a: "Quality double glazed windows typically last 20–35 years. Signs of failure include condensation between panes (seal failure), draughts, difficulty opening or closing, and visible damage to the frame. Most MyApproved window fitters offer a minimum 10-year guarantee on installations.",
    },
  ],
  "heating-engineer": [
    {
      q: "How much does a heating engineer cost near me?",
      a: "Heating engineers near you charge £50–£80 per hour. A radiator replacement costs £150–£350; new central heating system installation runs £3,000–£7,000. All heating engineers on MyApproved are Gas Safe registered where required and reviewed by real local customers.",
    },
    {
      q: "How do I find a reliable heating engineer near me?",
      a: "MyApproved confirms every heating engineer's Gas Safe registration before listing. Post your heating job free and compare quotes from certified local engineers. For gas-related work, always use a Gas Safe registered engineer - it is a legal requirement in the UK.",
    },
    {
      q: "How often should central heating be serviced?",
      a: "Your boiler should be serviced annually, and the full central heating system checked every 3–5 years. Annual servicing maintains efficiency, keeps your warranty valid, identifies problems early, and most importantly ensures carbon monoxide safety. MyApproved heating engineers offer fixed-price annual service plans.",
    },
    {
      q: "What is the difference between a heating engineer and a plumber?",
      a: "A plumber handles water supply, drainage, and sanitary plumbing. A heating engineer specialises in boilers, radiators, underfloor heating, and heat pumps. For gas central heating work, the engineer must be Gas Safe registered. Many MyApproved tradespeople hold both plumbing and heating engineer qualifications.",
    },
  ],
  "loft-conversion": [
    {
      q: "How much does a loft conversion cost near me?",
      a: "Loft conversion builders near you typically quote £35,000–£60,000 for a dormer; £20,000–£35,000 for a Velux conversion. Prices vary by roof type, size, and specification. All MyApproved loft conversion contractors have their identity checked and their public liability insurance confirmed and monitored, and manage building regulations applications on your behalf.",
    },
    {
      q: "Do I need planning permission for a loft conversion?",
      a: "Most loft conversions fall under Permitted Development and don't require planning permission if the additional roof volume doesn't exceed 40m³ (terraced) or 50m³ (detached/semi-detached), and the roof isn't raised above the existing ridge line. Your MyApproved contractor will confirm your specific requirements before quoting.",
    },
    {
      q: "How long does a loft conversion take?",
      a: "A standard Velux loft conversion takes 3–4 weeks; a dormer conversion 6–8 weeks; a full mansard or hip-to-gable conversion 8–12 weeks. This includes structural work, roofing, insulation, first-fix, plastering, second-fix, and decoration. Your MyApproved builder will provide a detailed project timeline with the quote.",
    },
    {
      q: "Will a loft conversion add value to my home?",
      a: "A well-executed loft conversion typically adds 15–25% to a property's value. Across the UK, adding a bedroom and bathroom via a dormer conversion can add £30,000–£60,000 to a 3-bed semi. MyApproved contractors provide itemised quotes so you can accurately assess return on investment.",
    },
  ],
  "driveway-specialist": [
    {
      q: "How much does a new driveway cost near me?",
      a: "Driveway specialists near you charge £30–£50 per hour. A block-paved driveway for a typical 3-bed home costs £3,000–£7,000; resin bound runs £2,000–£5,000; tarmac £1,500–£4,000; gravel £500–£2,000. All driveway specialists on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local homeowners.",
    },
    {
      q: "Do I need planning permission for a new driveway?",
      a: "Driveways using permeable surfaces (resin bound, gravel, block paving with gaps) do not typically require planning permission. Impermeable surfaces (solid concrete, tarmac) over 5m² in front gardens require a SuDS drainage solution or planning permission under Schedule 2, Part 1, Class F of the Town and Country Planning Order.",
    },
    {
      q: "How long does a driveway installation take?",
      a: "A standard block-paved driveway (50–60m²) typically takes 3–5 days: day 1 for excavation, days 2–3 for sub-base and edging, day 4 for laying, day 5 for pointing and finishing. Resin bound driveways take 2–3 days. Your MyApproved driveway specialist will confirm the timeline with your quote.",
    },
    {
      q: "What is the most durable driveway material?",
      a: "Block paving and resin bound aggregate are the most durable options, lasting 25–30 years with minimal maintenance. Tarmac lasts 15–20 years. Gravel is the most affordable but requires ongoing maintenance (raking, topping up). All MyApproved driveway specialists will explain material options and long-term costs as part of the quoting process.",
    },
  ],
  "solar-panel-installer": [
    {
      q: "How much does solar panel installation cost near me?",
      a: "Solar panel installers near you charge £500–£1,500 per day. A standard 4kW domestic system costs £5,000–£8,000 fully installed; with battery storage, £8,000–£14,000. All solar installers on MyApproved are MCS certified - a requirement to access Smart Export Guarantee export payments.",
    },
    {
      q: "How do I find a MCS certified solar installer near me?",
      a: "MyApproved verifies MCS certification for every solar panel installer before listing. MCS certification is mandatory to access SEG export payments and government incentives. Post your solar enquiry free and receive quotes from certified local installers.",
    },
    {
      q: "How long does it take solar panels to pay for themselves?",
      a: "In the UK, solar panels typically pay back in 7–10 years through reduced electricity bills and Smart Export Guarantee export payments. A 4kW system generates approximately 3,400–4,000 kWh per year in the Midlands, saving around £800–£1,200 annually at current energy prices.",
    },
    {
      q: "Do solar panels work in cloudy weather?",
      a: "Yes. Solar panels generate electricity from daylight, not direct sunlight. They produce approximately 10–25% of their rated output on overcast days. The UK's average 1,350–1,750 peak sun hours per year makes domestic solar financially viable across all regions of the UK.",
    },
  ],
  default: [
    {
      q: "How much do tradespeople charge near me?",
      a: "Tradespeople near you provide upfront fixed-price quotes with no hidden fees. Hourly rates vary by trade: plumbers £40–£70, electricians £45–£75, builders £35–£60, roofers £35–£55. All tradespeople on MyApproved have their identity checked and their public liability insurance confirmed and monitored, and are reviewed by real local customers - post your job free today.",
    },
    {
      q: "How does MyApproved verify tradespeople?",
      a: "Every tradesperson on MyApproved has their identity checked and their public liability insurance confirmed and monitored. Reviews are left only by customers who completed a confirmed booking - no anonymous or fake reviews.",
    },
    {
      q: "Is MyApproved free to use for homeowners?",
      a: "Yes, completely free. Getting quotes from tradespeople on MyApproved costs homeowners nothing. You only pay the tradesperson directly for completed work. There are no hidden admin fees, commission charges, or subscription costs for customers - ever.",
    },
    {
      q: "How quickly will I receive quotes from local tradespeople?",
      a: "Most homeowners receive their first quote within a few hours of posting a job on MyApproved. Emergency trades such as plumbers, electricians, and locksmiths typically respond within 1–2 hours. Verified tradespeople who match your job call you back with a fixed written quote - no obligation to accept.",
    },
  ],
};

// ── Administrative area lookup ────────────────────────────────────────────────
const PLACE_ADMIN_MAP: Record<string, string> = {
  Hanley: "Staffordshire", Longton: "Staffordshire", Burslem: "Staffordshire",
  Fenton: "Staffordshire", Tunstall: "Staffordshire", Stoke: "Staffordshire",
  Meir: "Staffordshire", Blurton: "Staffordshire", Bentilee: "Staffordshire",
  "Abbey Hulton": "Staffordshire", Trentham: "Staffordshire", "Trent Vale": "Staffordshire",
  Basford: "Staffordshire", Northwood: "Staffordshire", Shelton: "Staffordshire",
  Smallthorne: "Staffordshire", Cobridge: "Staffordshire", Penkhull: "Staffordshire",
  "Weston Coyney": "Staffordshire", Dresden: "Staffordshire",
  "Stoke-on-Trent": "Staffordshire",
  Stafford: "Staffordshire", Lichfield: "Staffordshire", Tamworth: "Staffordshire",
  Cannock: "Staffordshire", "Burton upon Trent": "Staffordshire",
  "Newcastle-under-Lyme": "Staffordshire", Stone: "Staffordshire",
  Rugeley: "Staffordshire", Uttoxeter: "Staffordshire", Leek: "Staffordshire",
  Kidsgrove: "Staffordshire", Cheadle: "Staffordshire", Burntwood: "Staffordshire",
  Biddulph: "Staffordshire",
  Sandbach: "Cheshire East", Crewe: "Cheshire East", Congleton: "Cheshire East",
  Macclesfield: "Cheshire East", Wilmslow: "Cheshire East", Nantwich: "Cheshire East",
  Knutsford: "Cheshire East", Middlewich: "Cheshire East", Alsager: "Cheshire East",
  "Holmes Chapel": "Cheshire East",
  Northwich: "Cheshire West and Chester", Chester: "Cheshire West and Chester",
  "Ellesmere Port": "Cheshire West and Chester", Winsford: "Cheshire West and Chester",
};

function resolveAdminArea(city: string, neighborhood?: string): string {
  return (neighborhood && PLACE_ADMIN_MAP[neighborhood]) ?? PLACE_ADMIN_MAP[city] ?? "England";
}

function toTitleCase(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toLocationSlug(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ProgrammaticSchemaProps {
  tradeType: string;
  city: string;
  neighborhood?: string;
  postalCode?: string;
  pageUrl?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProgrammaticSchema({
  tradeType,
  city,
  neighborhood,
  postalCode,
  pageUrl,
}: ProgrammaticSchemaProps) {
  const schemaType  = TRADE_SCHEMA_TYPE[tradeType.toLowerCase()] ?? "LocalBusiness";
  const adminArea   = resolveAdminArea(city, neighborhood);
  const tradeName   = toTitleCase(tradeType);
  const localLabel  = neighborhood ? `${neighborhood}, ${city}` : city;
  const locationSlug = toLocationSlug(neighborhood ?? city);
  const canonical   = pageUrl ?? `https://myapproved.com/find-tradespeople/${tradeType}/${locationSlug}`;
  const faqs        = TRADE_FAQS[tradeType.toLowerCase()] ?? TRADE_FAQS.default;
  const price       = TRADE_PRICE[tradeType.toLowerCase()];

  // ── 1. LocalBusiness / trade-specific type ────────────────────────────────
  const localBusinessSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": canonical,
    name: `${tradeName}s in ${localLabel} | MyApproved`,
    description: `Find ${tradeName.toLowerCase()}s in ${localLabel}${postalCode ? ` ${postalCode}` : ""} with their identity checked and public liability insurance confirmed and monitored. Get free no-obligation quotes on MyApproved.`,
    url: canonical,
    image: "https://myapproved.com/logo-icon.svg",
    logo: {
      "@type": "ImageObject",
      url: "https://myapproved.com/logo-icon.svg",
      width: 512,
      height: 512,
    },
    priceRange: price ? `£${price.low}–£${price.high}/hr` : "££",
    currenciesAccepted: "GBP",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "07:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "07:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "08:00", closes: "18:00" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      ...(postalCode ? { postalCode } : {}),
      addressRegion: adminArea,
      addressCountry: "GB",
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: adminArea,
        containsPlace: neighborhood
          ? [{ "@type": "City", name: city, containsPlace: [{ "@type": "Neighborhood", name: neighborhood, ...(postalCode ? { postalCode } : {}) }] }]
          : [{ "@type": "City", name: city, ...(postalCode ? { postalCode } : {}) }],
      },
    ],
    ...(price ? {
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: price.low,
          maxPrice: price.high,
          priceCurrency: "GBP",
          unitText: "hour",
        },
      },
    } : {}),
  };

  // ── 2. FAQPage ────────────────────────────────────────────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  // ── 3. BreadcrumbList - correct /find-tradespeople/ paths ─────────────────
  const breadcrumbItems: Array<{ "@type": string; position: number; name: string; item: string }> = [
    { "@type": "ListItem", position: 1, name: "Home",              item: "https://myapproved.com" },
    { "@type": "ListItem", position: 2, name: "Find Tradespeople", item: "https://myapproved.com/find-tradespeople" },
    { "@type": "ListItem", position: 3, name: `${tradeName}s`,     item: `https://myapproved.com/find-tradespeople/${tradeType}` },
    { "@type": "ListItem", position: 4, name: city,                item: `https://myapproved.com/find-tradespeople/${tradeType}/${toLocationSlug(city)}` },
  ];
  if (neighborhood) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 5,
      name: neighborhood,
      item: canonical,
    });
  }
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  // ── 4. Service - nested areaServed ────────────────────────────────────────
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${tradeName} Services in ${localLabel}`,
    serviceType: tradeName,
    description: `${tradeName.charAt(0).toUpperCase() + tradeName.slice(1)} services in ${localLabel}${postalCode ? ` ${postalCode}` : ""}. Free quotes, no obligation. All tradespeople have their identity checked and public liability insurance confirmed and monitored on MyApproved.`,
    provider: {
      "@type": "Organization",
      "@id": "https://myapproved.com/#organization",
      name: "MyApproved",
      url: "https://myapproved.com",
    },
    areaServed: {
      "@type": neighborhood ? "Neighborhood" : "City",
      name: neighborhood ?? city,
      containedInPlace: neighborhood
        ? { "@type": "City", name: city, containedInPlace: { "@type": "AdministrativeArea", name: adminArea, containedInPlace: { "@type": "Country", name: "United Kingdom" } } }
        : { "@type": "AdministrativeArea", name: adminArea, containedInPlace: { "@type": "Country", name: "United Kingdom" } },
    },
    ...(price ? {
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: price.low,
          maxPrice: price.high,
          priceCurrency: "GBP",
          unitText: "hour",
        },
      },
    } : {}),
  };

  const schemas = [localBusinessSchema, faqSchema, breadcrumbSchema, serviceSchema];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
