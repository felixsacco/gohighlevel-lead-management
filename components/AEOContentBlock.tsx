/**
 * AEOContentBlock - Answer Engine Optimisation content fragment.
 *
 * Renders 2 high-intent Q&A pairs per trade, marked up with FAQPage microdata.
 * Optimised for extraction by Google Gemini, Perplexity, ChatGPT Search, and ClaudeBot.
 *
 * Content strategy: Transaction-first. Every answer surfaces the MyApproved
 * identity, business and insurance checks and drives quote conversion.
 * Zero generic filler. Zero "what is a plumber" explanatory content.
 */

interface AEOEntry {
  q1: (location: string, pd?: string) => string;
  a1: (location: string, pd?: string) => string;
  q2: (location: string) => string;
  a2: (location: string) => string;
}

const AEO_DATA: Record<string, AEOEntry> = {
  plumber: {
    q1: (loc, pd) => `How much does a verified plumber cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Plumbers in ${loc}${pd ? ` ${pd}` : ""} charge £40–£70/hour for standard work; £80–£150/hour for emergency call-outs. Common jobs: tap replacement £80–£150, boiler service £80–£120, burst pipe repair £150–£400. Plumbers on MyApproved carrying out gas work are Gas Safe registered, have public liability cover of £2m confirmed and monitored, and are identity checked before quoting. Get 3 free quotes - no obligation.`,
    q2: (loc) =>
      `How does MyApproved verify a plumber in ${loc} before they can quote?`,
    a2: (loc) =>
      `MyApproved applies a pre-listing check to every ${loc} plumber: identity checked, public liability cover of £2m confirmed and monitored, and Gas Safe registration checked where applicable. Unlike directories that accept self-reported credentials, MyApproved independently verifies each document. Every member is fully re-verified annually. Only plumbers who pass the checks can receive quote requests.`,
  },

  electrician: {
    q1: (loc, pd) => `What do verified electricians charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Part P registered electricians, NICEIC or NAPIT, in ${loc}${pd ? ` ${pd}` : ""} charge £45–£75/hour. Fuse board upgrade: £350–£700. Full rewire (3-bed): £3,000–£5,500. EV charger installation: £800–£1,200. All electrical work by MyApproved electricians is carried out by Part P registered electricians with full building control notification - a legal requirement for domestic electrical work in England and Wales. Post your job free and compare verified quotes.`,
    q2: (loc) =>
      `How does MyApproved confirm an electrician in ${loc} is properly qualified?`,
    a2: (loc) =>
      `Every electrician on MyApproved for work in ${loc} is identity checked, has public liability cover of £2m confirmed and monitored, and is a Part P registered electrician, NICEIC or NAPIT, with their registration number checked directly. MyApproved independently verifies each registration number - not self-declared. Part P compliance is a legal requirement; unregistered electricians represent a prosecutable safety risk. MyApproved removes any electrician whose certification lapses.`,
  },

  roofer: {
    q1: (loc, pd) => `How much does a roofer cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Roofers in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Typical costs: minor repair £150–£500, major repair £500–£2,000, full re-roof £5,000–£12,000 for a typical semi. Lead work: £50–£90/m². Every MyApproved roofer has public liability cover confirmed and monitored and provides a detailed written quote before work begins - no verbal estimates that shift mid-job.`,
    q2: (loc) =>
      `How does MyApproved protect homeowners hiring a roofer in ${loc}?`,
    a2: (loc) =>
      `Unverified roofers are one of the most common sources of home improvement fraud in the UK. MyApproved counters this with a pre-listing check for every ${loc} roofer: identity checked, public liability cover of £2m confirmed and monitored, and NFRC membership checked where applicable. Written quotes are required before any work can be agreed. No MyApproved roofer can demand cash-only payment or skip the written quote stage.`,
  },

  "gas-engineer": {
    q1: (loc, pd) => `How much does a Gas Safe engineer charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Gas Safe registered engineers in ${loc}${pd ? ` ${pd}` : ""} charge £60–£100/hour. Boiler service: £80–£120. Boiler repair: £150–£600. New boiler installation: £1,500–£4,000. Landlord CP12 gas safety certificate: from £60. It is illegal for any unregistered person to carry out gas work in a UK home. Every engineer on MyApproved is Gas Safe registered before they can receive any quote request.`,
    q2: (loc) =>
      `How does MyApproved verify Gas Safe registration for engineers in ${loc}?`,
    a2: (loc) =>
      `MyApproved checks each engineer's 7-digit Gas Safe registration number directly against the Gas Safe Register - not via self-declaration. Checks include: identity checked, public liability cover of £2m confirmed and monitored, live Gas Safe registration status, and applicable gas categories (natural gas, LPG, commercial). If a registration lapses, the engineer is immediately suspended from the platform. This is legally required and non-negotiable.`,
  },

  builder: {
    q1: (loc, pd) => `How much do verified builders charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Builders in ${loc}${pd ? ` ${pd}` : ""} charge £35–£60/hour for labour. Project costs: single-storey extension £20,000–£45,000, loft conversion £30,000–£60,000, garage conversion £10,000–£25,000, full renovation £50,000–£150,000+. MyApproved builders provide itemised written quotes - materials, labour, and programme - before signing any agreement.Compare 3 verified quotes free.`,
    q2: (loc) =>
      `What verification does MyApproved carry out on builders in ${loc}?`,
    a2: (loc) =>
      `Builders are the UK's most regulated-yet-inconsistent trade. MyApproved applies a pre-listing check to every ${loc} builder: identity checked, public liability cover of £2m confirmed and monitored, and FMB or NHBC membership checked where applicable. Every member is fully re-verified annually. Planning consent and building regulations compliance are discussed at quote stage - MyApproved builders do not skip building control notification.`,
  },

  carpenter: {
    q1: (loc, pd) => `What do carpenters and joiners charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Carpenters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Fitted wardrobe: £800–£3,500. Kitchen fitting (labour only): £1,000–£4,000. Staircase replacement: £3,000–£8,000. Skirting and architrave: £15–£30/metre. All MyApproved carpenters provide itemised, fixed-price written quotes before work starts. Post your job free to compare 3 verified carpenter quotes in your area.`,
    q2: (loc) =>
      `How does MyApproved verify a carpenter in ${loc}?`,
    a2: (loc) =>
      `MyApproved requires all ${loc} carpenters to pass: identity checked, and public liability cover of £2m confirmed and monitored. Every member is fully re-verified annually. Bespoke joinery work requires signed-off completed projects. Carpenters are removed if their cover lapses.`,
  },

  plasterer: {
    q1: (loc, pd) => `How much does plastering cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Plasterers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour or £200–£600 per room for a skim coat. Full house re-plaster: £2,500–£6,000. External rendering: £40–£70/m². Dry-lining: £10–£25/m². Every MyApproved plasterer is identity checked and has public liability cover of £2m confirmed and monitored. Written quotes only - no verbal agreements. Compare 3 free quotes from verified local plasterers.`,
    q2: (loc) =>
      `What does MyApproved check before a plasterer can work in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing check for ${loc} plasterers: identity checked, and public liability cover of £2m confirmed and monitored. External rendering and damp-related plastering require specialist evidence reviewed at the pre-listing stage.`,
  },

  "painter-decorator": {
    q1: (loc, pd) => `What do painters and decorators charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Painters and decorators in ${loc}${pd ? ` ${pd}` : ""} charge £25–£45/hour or £400–£1,200 per room including materials. Full 3-bed interior: £2,500–£5,000. Exterior painting (3-bed semi): £2,000–£5,000. Wallpaper hanging: £150–£350/room. All MyApproved decorators are identity checked and have public liability cover confirmed and monitored, with reviews from confirmed homeowners only. Get 3 free no-obligation quotes now.`,
    q2: (loc) =>
      `How does MyApproved vet a painter and decorator in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing checks for ${loc} painters: identity checked, and public liability cover of £2m confirmed and monitored. Reviews are left only by homeowners who completed a confirmed booking - not anonymous or unverified submissions.`,
  },

  painter: {
    q1: (loc, pd) => `What do painters and decorators charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Painters and decorators in ${loc}${pd ? ` ${pd}` : ""} charge £25–£45/hour or £400–£1,200 per room including materials. Full 3-bed interior: £2,500–£5,000. Exterior painting (3-bed semi): £2,000–£5,000. All MyApproved decorators are identity checked and have public liability cover confirmed and monitored, with reviews from confirmed homeowners. Get 3 free no-obligation quotes now.`,
    q2: (loc) =>
      `How does MyApproved vet a painter and decorator in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing checks for ${loc} painters: identity checked, and public liability cover of £2m confirmed and monitored. Reviews on MyApproved are gated to confirmed bookings only - no anonymous submissions.`,
  },

  cleaner: {
    q1: (loc, pd) => `How much does a professional cleaner cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Professional cleaners in ${loc}${pd ? ` ${pd}` : ""} charge £15–£25/hour. One-off deep clean: £100–£300. End-of-tenancy clean: £150–£400 depending on property size. Regular domestic clean (3-bed, weekly): £50–£100/session. Every cleaner on MyApproved is identity checked and reviewed only by confirmed clients. No anonymous reviews.`,
    q2: (loc) =>
      `What checks does MyApproved carry out on cleaners in ${loc}?`,
    a2: (loc) =>
      `MyApproved's verification for ${loc} cleaners: identity checked - critically important for home access, and public liability cover of £1m confirmed and monitored. Cleaners with home access hold a basic DBS certificate. Only cleaners who pass the checks can accept bookings via MyApproved. Reviews require a confirmed booking - no self-submitted or anonymous ratings.`,
  },

  handyman: {
    q1: (loc, pd) => `How much does a local handyman charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Handymen in ${loc}${pd ? ` ${pd}` : ""} charge £25–£40/hour with a minimum 1–2 hour call-out. Half-day rate: £80–£150. Full day: £150–£280. Common tasks: flat-pack assembly (£50–£150), picture hanging (£30–£60), minor repairs (£60–£200). Every MyApproved handyman is identity checked, has public liability cover confirmed and monitored, and is reviewed by real local homeowners - no fake reviews.`,
    q2: (loc) =>
      `What does MyApproved verify before a handyman can quote in ${loc}?`,
    a2: (loc) =>
      `Handymen in ${loc} must pass MyApproved's pre-listing check: identity checked, and public liability cover of £1m confirmed and monitored. Any handyman undertaking notifiable electrical work must be a Part P registered electrician, NICEIC or NAPIT - MyApproved checks this separately. Unregistered electrical work is rejected.`,
  },

  locksmith: {
    q1: (loc, pd) => `How much does an emergency locksmith cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Locksmiths in ${loc}${pd ? ` ${pd}` : ""} charge £60–£120/hour. Emergency lockout: £75–£200 depending on time of day and lock type. Lock replacement (standard): £80–£200. Anti-snap lock upgrade: £100–£200. All MyApproved locksmiths provide a fixed price before beginning work - no up-selling on arrival, no hidden call-out fees. Only use a locksmith that has passed MyApproved's pre-listing check for property security work.`,
    q2: (loc) =>
      `How does MyApproved stop rogue locksmiths from listing in ${loc}?`,
    a2: (loc) =>
      `Rogue locksmiths are a well-documented consumer risk. MyApproved prevents listing with a pre-listing check: identity checked, public liability cover of £2m confirmed and monitored, and Master Locksmiths Association (MLA) membership checked. Fixed-price quoting before work is mandatory for all MyApproved locksmiths.`,
  },

  landscaper: {
    q1: (loc, pd) => `How much does a landscaper charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Landscapers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Patio installation: £1,500–£6,000. Garden design (full): £3,000–£15,000. Fencing: £80–£150/metre. Decking installation: £1,200–£5,000. All MyApproved landscapers have public liability cover of £2m confirmed and monitored, are identity checked, and provide itemised written quotes. Drainage and groundwork projects may require a separate structural check - MyApproved confirms this at pre-listing.`,
    q2: (loc) =>
      `What verification does MyApproved apply to landscapers in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing check for ${loc} landscapers: identity checked, public liability cover of £2m confirmed and monitored, and BALI or APL membership checked where applicable. Landscapers undertaking drainage, retaining walls, or structural groundwork must provide engineering evidence - reviewed at pre-listing stage.`,
  },

  gardener: {
    q1: (loc, pd) => `How much does a gardener charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Gardeners in ${loc}${pd ? ` ${pd}` : ""} charge £25–£40/hour. Regular maintenance (monthly): £50–£120/visit. Full garden clearance: £150–£500. Hedge trimming: £80–£300 depending on size. Lawn treatment: £30–£80. Every MyApproved gardener is identity checked, has public liability cover confirmed and monitored, and is reviewed only by confirmed clients. Post your job free and compare 3 quotes - no obligation to hire.`,
    q2: (loc) =>
      `How does MyApproved vet gardeners before they can work in ${loc}?`,
    a2: (loc) =>
      `MyApproved's verification for ${loc} gardeners: identity checked, public liability cover of £1m confirmed and monitored, and horticultural certification checked where specialist work (tree surgery, pesticide application) is offered. Gardeners offering pesticide or herbicide application must hold a PA1/PA6 certificate - MyApproved checks this at pre-listing. Tree surgeons additionally require NPTC certification evidence.`,
  },

  "heating-engineer": {
    q1: (loc, pd) => `How much does a heating engineer charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Heating engineers in ${loc}${pd ? ` ${pd}` : ""} charge £50–£80/hour. Radiator replacement: £150–£350. New central heating system: £3,000–£7,000. Power flush: £300–£600. Thermostatic radiator valves: £100–£250. Gas-connected heating work requires Gas Safe registration - checked by MyApproved before any engineer can list. Post your job free and receive quotes within hours.`,
    q2: (loc) =>
      `How does MyApproved confirm a heating engineer's qualifications in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing check for ${loc} heating engineers: identity checked, public liability cover of £2m confirmed and monitored, and Gas Safe registration checked for any gas-connected work (legally mandatory). OFTEC registration is also checked for oil-fired systems where applicable. Like gas engineers, heating engineers working on gas appliances are checked against the live Gas Safe register - not self-declared. Unregistered heating work on gas systems is illegal.`,
  },

  "kitchen-fitter": {
    q1: (loc, pd) => `How much does kitchen fitting cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Kitchen fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Labour-only fitting: £1,000–£5,000. Supply-and-fit (mid-range): £8,000–£20,000. Supply-and-fit (premium): £20,000+. Kitchen work typically involves multiple trades: fitting, plumbing, and electrics. MyApproved can source verified professionals for all 3 trades independently or as a coordinated team. Get itemised quotes across all disciplines, free.`,
    q2: (loc) =>
      `What does MyApproved verify for a kitchen fitter in ${loc}?`,
    a2: (loc) =>
      `Kitchen fitting involves regulated sub-trades. MyApproved's check for ${loc} kitchen fitters: identity checked, public liability cover of £2m confirmed and monitored, and holds an NVQ Level 2/3 in kitchen installation or a CSCS card. Where the kitchen fitter also carries out plumbing or electrical work, MyApproved separately checks Gas Safe registration or that they are a Part P registered electrician, NICEIC or NAPIT. Dual-trade work without secondary registration is flagged and rejected.`,
  },

  "bathroom-fitter": {
    q1: (loc, pd) => `How much does a bathroom fitter charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Bathroom fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Full bathroom renovation: £3,000–£10,000. En-suite: £2,000–£6,000. Wetroom conversion: £3,500–£8,000. Labour-only fit (supply your own suite): £800–£2,000. MyApproved bathroom fitters provide an itemised schedule of works before any contract is agreed. Compare 3 verified quotes, free.`,
    q2: (loc) =>
      `How does MyApproved verify a bathroom fitter in ${loc}?`,
    a2: (loc) =>
      `Bathroom fitting involves plumbing and often electrical work - both regulated trades. MyApproved's check for ${loc} bathroom fitters: identity checked, public liability cover of £2m confirmed and monitored, and holds a plumbing qualification (City & Guilds or NVQ Level 2/3). Bathroom fitters who carry out Part P electrical work (e.g. shower installation, shaver sockets) must be a Part P registered electrician, NICEIC or NAPIT - MyApproved checks this separately.`,
  },

  "window-fitter": {
    q1: (loc, pd) => `How much do window and door fitters charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Window fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. UPVC window (supply and fit): £400–£800 each. Full set of windows (3-bed): £3,000–£8,000. Bifold doors: £2,500–£6,000 per set. FENSA registration is a legal requirement for replacement windows in England and Wales - every MyApproved window fitter is FENSA or CERTASS registered, number checked, before listing.`,
    q2: (loc) =>
      `How does MyApproved verify FENSA registration for window fitters in ${loc}?`,
    a2: (loc) =>
      `Replacement windows in England and Wales require FENSA or CERTASS registration - it is a legal compliance requirement, not optional. MyApproved verifies each ${loc} window fitter's registration number directly against the FENSA or CERTASS database. Full check: identity checked, public liability cover of £2m confirmed and monitored, and FENSA or CERTASS registered, number checked. Unregistered window fitters cannot list on MyApproved.`,
  },

  tiler: {
    q1: (loc, pd) => `How much does a tiler charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Tilers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Bathroom tiling: £300–£800. Kitchen splashback: £150–£400. Floor tiling (per m²): £30–£60 including materials. Wetroom or shower tray waterproofing system: add £200–£500. Every MyApproved tiler provides a written quote that specifies adhesive specification, grout type, and waterproofing method - no verbal agreements that change mid-project.`,
    q2: (loc) =>
      `What checks does MyApproved apply to tilers in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing check for ${loc} tilers: identity checked, public liability cover of £2m confirmed and monitored, and holds a City & Guilds Wall and Floor Tiling NVQ Level 2/3 or CSCS card. Wetroom and shower tray waterproofing requires evidence of WRAS-compliant tanking system experience - reviewed at the pre-listing stage.`,
  },

  "solar-panel-installer": {
    q1: (loc, pd) => `How much does solar panel installation cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Solar installers in ${loc}${pd ? ` ${pd}` : ""} quote £500–£1,500/day. Standard 4kW system: £5,000–£8,000 fully installed. With battery storage: £8,000–£14,000. MCS certification is legally required to access Smart Export Guarantee (SEG) payments - every MyApproved solar installer is MCS certified, number checked, before listing. Post your solar enquiry free and compare quotes from certified local installers.`,
    q2: (loc) =>
      `Why does MCS certification matter for solar installers in ${loc}?`,
    a2: (loc) =>
      `MCS certification is mandatory to access Smart Export Guarantee export payments and to claim any government solar incentive in the UK. MyApproved verifies each ${loc} solar installer's live MCS registration number directly - not via self-declaration. Full check: identity checked, public liability cover of £2m confirmed and monitored, and MCS certified, number checked. Uncertified installers are barred from listing.`,
  },

  "loft-conversion": {
    q1: (loc, pd) => `How much does a loft conversion cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Loft conversion builders in ${loc}${pd ? ` ${pd}` : ""} quote: Velux conversion £20,000–£35,000, dormer conversion £35,000–£60,000, hip-to-gable £45,000–£65,000, mansard £50,000–£70,000. Prices include structural work, insulation, staircase, and first fix. MyApproved contractors provide full planning and building regulations support as part of the project - not an add-on. Compare 3 detailed written quotes, free.`,
    q2: (loc) =>
      `What building regulations apply to loft conversions in ${loc}?`,
    a2: (loc) =>
      `Loft conversions in ${loc} require building regulations approval (not just planning permission) covering: structural calculations, fire safety (30-minute fire doors, mains-wired smoke alarms), insulation (minimum U-value 0.18 W/m²K), and staircase specification. MyApproved loft conversion contractors are verified to submit building regulations applications on your behalf. Every contractor passes: identity checked, public liability cover of £2m confirmed and monitored, and structural engineering evidence.`,
  },

  "driveway-specialist": {
    q1: (loc, pd) => `How much does a new driveway cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Driveway specialists in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Block paving (3-bed, ~40m²): £3,000–£7,000. Resin bound: £2,000–£5,000. Tarmac: £1,500–£4,000. Gravel: £500–£2,000. Permeable driveways over 5m² in front gardens do not require planning permission in England - your MyApproved specialist confirms this at quote stage. Compare 3 verified quotes, free.`,
    q2: (loc) =>
      `What planning rules apply to driveways in ${loc} and how does MyApproved handle this?`,
    a2: (loc) =>
      `Since 2008, hard impermeable surfaces over 5m² in front gardens in England require planning permission unless SuDS drainage is incorporated. Permeable surfaces (resin bound, block paving with open-joint gaps, gravel) are exempt. Every MyApproved driveway specialist in ${loc} confirms planning compliance in their written quote. Checks: identity checked, public liability cover of £2m confirmed and monitored, and BALI or similar trade body membership where held.`,
  },

  default: {
    q1: (loc, pd) => `How much do verified tradespeople charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Verified tradespeople in ${loc}${pd ? ` ${pd}` : ""} provide fixed-price written quotes before any work begins - no verbal estimates that shift mid-job. Rates vary by trade: plumbers £40–£70/hour, electricians £45–£75, builders £35–£60, roofers £35–£55. Post your job free on MyApproved and receive up to 3 competitive quotes from identity checked professionals with public liability cover confirmed and monitored. No hidden fees, no obligation to accept.`,
    q2: (loc) =>
      `How does MyApproved verify tradespeople before they work in ${loc}?`,
    a2: (loc) =>
      `Every tradesperson listed on MyApproved for work in ${loc} passes a pre-listing check: identity checked, public liability cover confirmed and monitored, and holds the relevant registration or qualification (Gas Safe, NICEIC, FENSA, or relevant body where applicable). Unlike directories that accept self-reported credentials, MyApproved independently verifies each document. Checks are renewed annually.`,
  },
};

export interface AEOContentBlockProps {
  tradeType: string;
  city: string;
  neighborhood?: string;
  postalDistrict?: string;
  className?: string;
}

export default function AEOContentBlock({
  tradeType,
  city,
  neighborhood,
  postalDistrict,
  className = "",
}: AEOContentBlockProps) {
  const entry     = AEO_DATA[tradeType.toLowerCase()] ?? AEO_DATA.default;
  const locLabel  = neighborhood ? `${neighborhood}, ${city}` : city;
  const tradeName = tradeType.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const q1        = entry.q1(locLabel, postalDistrict);
  const a1        = entry.a1(locLabel, postalDistrict);
  const q2        = entry.q2(locLabel);
  const a2        = entry.a2(locLabel);

  return (
    <section
      aria-label={`${tradeName} pricing and verification information for ${locLabel}`}
      className={`bg-white border border-blue-100 py-6 px-5 sm:px-7 ${className}`}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Q1 - Pricing intent */}
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h2
            className="text-base sm:text-lg font-extrabold text-brand-navy mb-1.5 leading-snug"
            itemProp="name"
          >
            {q1}
          </h2>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p
              className="text-sm sm:text-[15px] text-blue-900/80 leading-relaxed"
              itemProp="text"
            >
              {a1}
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-blue-50" />

        {/* Q2 - Verification intent */}
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h2
            className="text-base sm:text-lg font-extrabold text-brand-navy mb-1.5 leading-snug"
            itemProp="name"
          >
            {q2}
          </h2>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p
              className="text-sm sm:text-[15px] text-blue-900/80 leading-relaxed"
              itemProp="text"
            >
              {a2}
            </p>
          </div>
        </div>

        {/* Trust signal pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-50">
          {[
            "Identity checked",
            "Public liability insurance confirmed",
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-900 ring-1 ring-blue-100"
            >
              <span className="text-green-500 text-[10px]" aria-hidden="true">✓</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
