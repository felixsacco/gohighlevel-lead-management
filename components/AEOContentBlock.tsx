/**
 * AEOContentBlock - Answer Engine Optimisation content fragment.
 *
 * Renders 2 high-intent Q&A pairs per trade, marked up with FAQPage microdata.
 * Optimised for extraction by Google Gemini, Perplexity, ChatGPT Search, and ClaudeBot.
 *
 * Content strategy: Transaction-first. Every answer surfaces the MyApproved
 * 4-pillar verification process and drives quote conversion.
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
      `Verified plumbers in ${loc}${pd ? ` ${pd}` : ""} charge £40–£70/hour for standard work; £80–£150/hour for emergency call-outs. Common jobs: tap replacement £80–£150, boiler service £80–£120, burst pipe repair £150–£400. Every plumber on MyApproved is Gas Safe registered where required, carries £2M public liability insurance, and is ID-verified before quoting. Get 3 free quotes - no obligation.`,
    q2: (loc) =>
      `How does MyApproved verify a plumber in ${loc} before they can quote?`,
    a2: (loc) =>
      `MyApproved applies a 4-point pre-listing check to every ${loc} plumber: (1) government-issued ID verification, (2) £2M public liability insurance confirmation, (3) Gas Safe registration check where applicable, (4) customer reference screening. Unlike directories that accept self-reported credentials, MyApproved independently verifies each document. Verification is renewed annually. Only plumbers who pass all 4 checks can receive quote requests.`,
  },

  electrician: {
    q1: (loc, pd) => `What do verified electricians charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `NICEIC or NAPIT-certified electricians in ${loc}${pd ? ` ${pd}` : ""} charge £45–£75/hour. Fuse board upgrade: £350–£700. Full rewire (3-bed): £3,000–£5,500. EV charger installation: £800–£1,200. All electrical work by MyApproved electricians is Part P certified with full building control notification - a legal requirement for domestic electrical work in England and Wales. Post your job free and compare verified quotes.`,
    q2: (loc) =>
      `How does MyApproved confirm an electrician in ${loc} is properly qualified?`,
    a2: (loc) =>
      `Every electrician on MyApproved undergoes 4-point verification: government ID check, £2M public liability insurance confirmation, NICEIC or NAPIT registration check, and customer reference screening. MyApproved independently verifies NICEIC/NAPIT membership numbers directly - not self-declared. Part P compliance is a legal requirement; unverified electricians represent a prosecutable safety risk. MyApproved removes any electrician whose certification lapses.`,
  },

  roofer: {
    q1: (loc, pd) => `How much does a roofer cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Roofers in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Typical costs: minor repair £150–£500, major repair £500–£2,000, full re-roof £5,000–£12,000 for a typical semi. Lead work: £50–£90/m². Every MyApproved roofer carries verified public liability insurance and provides a detailed written quote before work begins - no verbal estimates that shift mid-job.`,
    q2: (loc) =>
      `How does MyApproved protect homeowners hiring a roofer in ${loc}?`,
    a2: (loc) =>
      `Unverified roofers are one of the most common sources of home improvement fraud in the UK. MyApproved counters this with 4 mandatory checks for every ${loc} roofer: government ID verification, £2M insurance confirmation, NFRC membership check where applicable, and customer reference screening. Written quotes are required before any work can be agreed. No MyApproved roofer can demand cash-only payment or skip the written quote stage.`,
  },

  "gas-engineer": {
    q1: (loc, pd) => `How much does a Gas Safe engineer charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Gas Safe registered engineers in ${loc}${pd ? ` ${pd}` : ""} charge £60–£100/hour. Boiler service: £80–£120. Boiler repair: £150–£600. New boiler installation: £1,500–£4,000. Landlord CP12 gas safety certificate: from £60. It is illegal for any unregistered person to carry out gas work in a UK home. Every engineer on MyApproved is verified Gas Safe registered before they can receive any quote request.`,
    q2: (loc) =>
      `How does MyApproved verify Gas Safe registration for engineers in ${loc}?`,
    a2: (loc) =>
      `MyApproved verifies each engineer's 7-digit Gas Safe registration number directly against the Gas Safe Register - not via self-declaration. Checks include: government ID, £2M public liability insurance, live Gas Safe registration status, and applicable gas categories (natural gas, LPG, commercial). If a registration lapses, the engineer is immediately suspended from the platform. This is legally required and non-negotiable.`,
  },

  builder: {
    q1: (loc, pd) => `How much do verified builders charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Builders in ${loc}${pd ? ` ${pd}` : ""} charge £35–£60/hour for labour. Project costs: single-storey extension £20,000–£45,000, loft conversion £30,000–£60,000, garage conversion £10,000–£25,000, full renovation £50,000–£150,000+. MyApproved builders provide itemised written quotes - materials, labour, and programme - before signing any agreement. Compare 3 verified quotes free.`,
    q2: (loc) =>
      `What verification does MyApproved carry out on builders in ${loc}?`,
    a2: (loc) =>
      `Builders are the UK's most regulated-yet-inconsistent trade. MyApproved applies 4 mandatory checks to every ${loc} builder: government ID verification, £2M public liability insurance confirmation (checked annually), FMB or NHBC membership check where applicable, and customer reference screening from recent completed projects. Planning consent and building regulations compliance are discussed at quote stage - MyApproved builders do not skip building control notification.`,
  },

  carpenter: {
    q1: (loc, pd) => `What do carpenters and joiners charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Carpenters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Fitted wardrobe: £800–£3,500. Kitchen fitting (labour only): £1,000–£4,000. Staircase replacement: £3,000–£8,000. Skirting and architrave: £15–£30/metre. All MyApproved carpenters provide itemised, fixed-price written quotes before work starts. Post your job free to compare 3 verified carpenter quotes in your area.`,
    q2: (loc) =>
      `How does MyApproved verify a carpenter in ${loc}?`,
    a2: (loc) =>
      `MyApproved requires all ${loc} carpenters to pass: government ID check, £2M public liability insurance confirmation, trade qualification verification (City & Guilds, NVQ Level 2/3 where applicable), and customer reference screening. Bespoke joinery work requires verified experience with signed-off completed projects. Carpenters are re-verified annually and removed if insurance lapses.`,
  },

  plasterer: {
    q1: (loc, pd) => `How much does plastering cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Plasterers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour or £200–£600 per room for a skim coat. Full house re-plaster: £2,500–£6,000. External rendering: £40–£70/m². Dry-lining: £10–£25/m². Every MyApproved plasterer is trade-qualified, insured to £2M, and ID-verified. Written quotes only - no verbal agreements. Compare 3 free quotes from verified local plasterers.`,
    q2: (loc) =>
      `What does MyApproved check before a plasterer can work in ${loc}?`,
    a2: (loc) =>
      `MyApproved's 4-point check for ${loc} plasterers: (1) government-issued ID verification, (2) £2M public liability insurance confirmation, (3) trade qualification check (NVQ Level 2/3 plastering or CSCS card), (4) customer reference screening from recent domestic projects. External rendering and damp-related plastering require specialist evidence reviewed at the pre-listing stage.`,
  },

  "painter-decorator": {
    q1: (loc, pd) => `What do painters and decorators charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Painters and decorators in ${loc}${pd ? ` ${pd}` : ""} charge £25–£45/hour or £400–£1,200 per room including materials. Full 3-bed interior: £2,500–£5,000. Exterior painting (3-bed semi): £2,000–£5,000. Wallpaper hanging: £150–£350/room. All MyApproved decorators are insured, ID-checked, and reviewed by verified homeowners only. Get 3 free no-obligation quotes now.`,
    q2: (loc) =>
      `How does MyApproved vet a painter and decorator in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing checks for ${loc} painters: government ID verification, £2M public liability insurance confirmation, trade qualification check (City & Guilds or NVQ Level 2 Decorative Occupations where held), and customer reference screening with photographic portfolio review. Reviews are left only by homeowners who completed a confirmed booking - not anonymous or unverified submissions.`,
  },

  painter: {
    q1: (loc, pd) => `What do painters and decorators charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Painters and decorators in ${loc}${pd ? ` ${pd}` : ""} charge £25–£45/hour or £400–£1,200 per room including materials. Full 3-bed interior: £2,500–£5,000. Exterior painting (3-bed semi): £2,000–£5,000. All MyApproved decorators are insured, ID-checked, and reviewed by verified homeowners. Get 3 free no-obligation quotes now.`,
    q2: (loc) =>
      `How does MyApproved vet a painter and decorator in ${loc}?`,
    a2: (loc) =>
      `MyApproved's pre-listing checks for ${loc} painters: government ID verification, £2M public liability insurance confirmation, trade qualification verification, and customer reference screening with photographic portfolio review. Reviews on MyApproved are gated to confirmed bookings only - no anonymous submissions.`,
  },

  cleaner: {
    q1: (loc, pd) => `How much does a professional cleaner cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Professional cleaners in ${loc}${pd ? ` ${pd}` : ""} charge £15–£25/hour. One-off deep clean: £100–£300. End-of-tenancy clean: £150–£400 depending on property size. Regular domestic clean (3-bed, weekly): £50–£100/session. Every cleaner on MyApproved is reference-checked, identity-verified, and reviewed only by confirmed clients. No anonymous reviews.`,
    q2: (loc) =>
      `What checks does MyApproved carry out on cleaners in ${loc}?`,
    a2: (loc) =>
      `MyApproved's verification for ${loc} cleaners: (1) government ID verification - critically important for home access, (2) £1M public liability insurance confirmation, (3) DBS check confirmation for cleaners with home access, (4) customer reference screening. Only cleaners who pass all checks can accept bookings via MyApproved. Reviews require a confirmed booking - no self-submitted or anonymous ratings.`,
  },

  handyman: {
    q1: (loc, pd) => `How much does a local handyman charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Handymen in ${loc}${pd ? ` ${pd}` : ""} charge £25–£40/hour with a minimum 1–2 hour call-out. Half-day rate: £80–£150. Full day: £150–£280. Common tasks: flat-pack assembly (£50–£150), picture hanging (£30–£60), minor repairs (£60–£200). Every MyApproved handyman is ID-checked, insured, and reviewed by real local homeowners - no fake reviews.`,
    q2: (loc) =>
      `What does MyApproved verify before a handyman can quote in ${loc}?`,
    a2: (loc) =>
      `Handymen in ${loc} must pass MyApproved's 4-point check: government ID verification, public liability insurance confirmation (minimum £1M), skill-specific qualification check where electrical or gas-adjacent work is involved, and customer reference screening. Any handyman undertaking notifiable electrical work must be NICEIC or NAPIT registered - MyApproved verifies this separately. Unqualified electrical work is rejected.`,
  },

  locksmith: {
    q1: (loc, pd) => `How much does an emergency locksmith cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Locksmiths in ${loc}${pd ? ` ${pd}` : ""} charge £60–£120/hour. Emergency lockout: £75–£200 depending on time of day and lock type. Lock replacement (standard): £80–£200. Anti-snap lock upgrade: £100–£200. All MyApproved locksmiths provide a fixed price before beginning work - no up-selling on arrival, no hidden call-out fees. Only use a MyApproved-verified locksmith for property security work.`,
    q2: (loc) =>
      `How does MyApproved stop rogue locksmiths from listing in ${loc}?`,
    a2: (loc) =>
      `Rogue locksmiths are a well-documented consumer risk. MyApproved prevents listing by: (1) government ID verification - identity confirmed before any job can be accepted, (2) £2M public liability insurance confirmation, (3) Master Locksmiths Association (MLA) or DBS check confirmation, (4) customer reference screening with specific verification of no Trading Standards complaints. Fixed-price quoting before work is mandatory for all MyApproved locksmiths.`,
  },

  landscaper: {
    q1: (loc, pd) => `How much does a landscaper charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Landscapers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Patio installation: £1,500–£6,000. Garden design (full): £3,000–£15,000. Fencing: £80–£150/metre. Decking installation: £1,200–£5,000. All MyApproved landscapers carry £2M public liability insurance, are ID-verified, and provide itemised written quotes. Drainage and groundwork projects may require a separate structural check - MyApproved confirms this at pre-listing.`,
    q2: (loc) =>
      `What verification does MyApproved apply to landscapers in ${loc}?`,
    a2: (loc) =>
      `MyApproved's 4-point check for ${loc} landscapers: government ID verification, £2M public liability insurance confirmation (garden and structural works require higher limits - checked separately), BALI or APL membership check where applicable, and customer reference screening with project photo evidence. Landscapers undertaking drainage, retaining walls, or structural groundwork must provide engineering qualification evidence - reviewed at pre-listing stage.`,
  },

  gardener: {
    q1: (loc, pd) => `How much does a gardener charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Gardeners in ${loc}${pd ? ` ${pd}` : ""} charge £25–£40/hour. Regular maintenance (monthly): £50–£120/visit. Full garden clearance: £150–£500. Hedge trimming: £80–£300 depending on size. Lawn treatment: £30–£80. Every MyApproved gardener is ID-verified, insured, and reviewed only by confirmed clients. Post your job free and compare 3 quotes - no obligation to hire.`,
    q2: (loc) =>
      `How does MyApproved vet gardeners before they can work in ${loc}?`,
    a2: (loc) =>
      `MyApproved's verification for ${loc} gardeners: government ID check, public liability insurance confirmation (minimum £1M), horticultural qualification check where specialist work (tree surgery, pesticide application) is offered, and customer reference screening. Gardeners offering pesticide or herbicide application must hold a PA1/PA6 certificate - MyApproved verifies this at pre-listing. Tree surgeons additionally require NPTC qualification evidence.`,
  },

  "heating-engineer": {
    q1: (loc, pd) => `How much does a heating engineer charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Heating engineers in ${loc}${pd ? ` ${pd}` : ""} charge £50–£80/hour. Radiator replacement: £150–£350. New central heating system: £3,000–£7,000. Power flush: £300–£600. Thermostatic radiator valves: £100–£250. Gas-connected heating work requires Gas Safe registration - verified by MyApproved before any engineer can list. Post your job free and receive quotes within hours.`,
    q2: (loc) =>
      `How does MyApproved confirm a heating engineer's qualifications in ${loc}?`,
    a2: (loc) =>
      `MyApproved's 4-point check for ${loc} heating engineers: (1) government ID verification, (2) £2M public liability insurance confirmation, (3) Gas Safe registration check for any gas-connected work (legally mandatory), (4) OFTEC registration for oil-fired systems where applicable. Like gas engineers, heating engineers working on gas appliances are verified against the live Gas Safe register - not self-declared. Unregistered heating work on gas systems is illegal.`,
  },

  "kitchen-fitter": {
    q1: (loc, pd) => `How much does kitchen fitting cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Kitchen fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Labour-only fitting: £1,000–£5,000. Supply-and-fit (mid-range): £8,000–£20,000. Supply-and-fit (premium): £20,000+. Kitchen work typically involves multiple trades: fitting, plumbing, and electrics. MyApproved can source verified professionals for all 3 trades independently or as a coordinated team. Get itemised quotes across all disciplines, free.`,
    q2: (loc) =>
      `What does MyApproved verify for a kitchen fitter in ${loc}?`,
    a2: (loc) =>
      `Kitchen fitting involves regulated sub-trades. MyApproved's check for ${loc} kitchen fitters: government ID verification, £2M public liability insurance, NVQ Level 2/3 kitchen installation or CSCS card, and customer reference screening with photo evidence of completed kitchens. Where the kitchen fitter also carries out plumbing or electrical work, MyApproved separately verifies Gas Safe or NICEIC registration. Dual-trade work without secondary registration is flagged and rejected.`,
  },

  "bathroom-fitter": {
    q1: (loc, pd) => `How much does a bathroom fitter charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Bathroom fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. Full bathroom renovation: £3,000–£10,000. En-suite: £2,000–£6,000. Wetroom conversion: £3,500–£8,000. Labour-only fit (supply your own suite): £800–£2,000. MyApproved bathroom fitters provide an itemised schedule of works before any contract is agreed. Compare 3 verified quotes, free.`,
    q2: (loc) =>
      `How does MyApproved verify a bathroom fitter in ${loc}?`,
    a2: (loc) =>
      `Bathroom fitting involves plumbing and often electrical work - both regulated trades. MyApproved's check for ${loc} bathroom fitters: government ID verification, £2M public liability insurance, plumbing qualification verification (City & Guilds or NVQ Level 2/3), and customer reference screening with project photos. Bathroom fitters who carry out Part P electrical work (e.g. shower installation, shaver sockets) must be NICEIC or NAPIT registered - MyApproved verifies this separately.`,
  },

  "window-fitter": {
    q1: (loc, pd) => `How much do window and door fitters charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Window fitters in ${loc}${pd ? ` ${pd}` : ""} charge £35–£55/hour. UPVC window (supply and fit): £400–£800 each. Full set of windows (3-bed): £3,000–£8,000. Bifold doors: £2,500–£6,000 per set. FENSA registration is a legal requirement for replacement windows in England and Wales - every MyApproved window fitter is FENSA-verified before listing.`,
    q2: (loc) =>
      `How does MyApproved verify FENSA registration for window fitters in ${loc}?`,
    a2: (loc) =>
      `Replacement windows in England and Wales require FENSA or CERTASS registration - it is a legal compliance requirement, not optional. MyApproved verifies each ${loc} window fitter's registration number directly against the FENSA or CERTASS database. Full check: government ID, £2M public liability insurance, live FENSA/CERTASS registration, and customer reference screening. Unregistered window fitters cannot list on MyApproved.`,
  },

  tiler: {
    q1: (loc, pd) => `How much does a tiler charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Tilers in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Bathroom tiling: £300–£800. Kitchen splashback: £150–£400. Floor tiling (per m²): £30–£60 including materials. Wetroom or shower tray waterproofing system: add £200–£500. Every MyApproved tiler provides a written quote that specifies adhesive specification, grout type, and waterproofing method - no verbal agreements that change mid-project.`,
    q2: (loc) =>
      `What checks does MyApproved apply to tilers in ${loc}?`,
    a2: (loc) =>
      `MyApproved's 4-point check for ${loc} tilers: government ID verification, £2M public liability insurance, trade qualification check (City & Guilds Wall and Floor Tiling NVQ Level 2/3 or CSCS card), and customer reference screening with photographic evidence of recent completed work. Wetroom and shower tray waterproofing requires evidence of WRAS-compliant tanking system experience - reviewed at the pre-listing stage.`,
  },

  "solar-panel-installer": {
    q1: (loc, pd) => `How much does solar panel installation cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Solar installers in ${loc}${pd ? ` ${pd}` : ""} quote £500–£1,500/day. Standard 4kW system: £5,000–£8,000 fully installed. With battery storage: £8,000–£14,000. MCS certification is legally required to access Smart Export Guarantee (SEG) payments - every MyApproved solar installer is MCS-certified before listing. Post your solar enquiry free and compare quotes from certified local installers.`,
    q2: (loc) =>
      `Why does MCS certification matter for solar installers in ${loc}?`,
    a2: (loc) =>
      `MCS certification is mandatory to access Smart Export Guarantee export payments and to claim any government solar incentive in the UK. MyApproved verifies each ${loc} solar installer's live MCS registration number directly - not via self-declaration. Full check: government ID, £2M public liability insurance, live MCS certification, and customer reference screening with completed system commissioning records. Uncertified installers are barred from listing.`,
  },

  "loft-conversion": {
    q1: (loc, pd) => `How much does a loft conversion cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Loft conversion builders in ${loc}${pd ? ` ${pd}` : ""} quote: Velux conversion £20,000–£35,000, dormer conversion £35,000–£60,000, hip-to-gable £45,000–£65,000, mansard £50,000–£70,000. Prices include structural work, insulation, staircase, and first fix. MyApproved contractors provide full planning and building regulations support as part of the project - not an add-on. Compare 3 detailed written quotes, free.`,
    q2: (loc) =>
      `What building regulations apply to loft conversions in ${loc}?`,
    a2: (loc) =>
      `Loft conversions in ${loc} require building regulations approval (not just planning permission) covering: structural calculations, fire safety (30-minute fire doors, mains-wired smoke alarms), insulation (minimum U-value 0.18 W/m²K), and staircase specification. MyApproved loft conversion contractors are verified to submit building regulations applications on your behalf. Every contractor passes: government ID, £2M insurance, structural engineering evidence, and completed-project reference review.`,
  },

  "driveway-specialist": {
    q1: (loc, pd) => `How much does a new driveway cost in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Driveway specialists in ${loc}${pd ? ` ${pd}` : ""} charge £30–£50/hour. Block paving (3-bed, ~40m²): £3,000–£7,000. Resin bound: £2,000–£5,000. Tarmac: £1,500–£4,000. Gravel: £500–£2,000. Permeable driveways over 5m² in front gardens do not require planning permission in England - your MyApproved specialist confirms this at quote stage. Compare 3 verified quotes, free.`,
    q2: (loc) =>
      `What planning rules apply to driveways in ${loc} and how does MyApproved handle this?`,
    a2: (loc) =>
      `Since 2008, hard impermeable surfaces over 5m² in front gardens in England require planning permission unless SuDS drainage is incorporated. Permeable surfaces (resin bound, block paving with open-joint gaps, gravel) are exempt. Every MyApproved driveway specialist in ${loc} confirms planning compliance in their written quote. Checks: government ID, £2M public liability insurance, BALI or similar trade body membership where held, and customer reference screening with drainage specification evidence.`,
  },

  default: {
    q1: (loc, pd) => `How much do verified tradespeople charge in ${loc}${pd ? ` (${pd})` : ""}?`,
    a1: (loc, pd) =>
      `Verified tradespeople in ${loc}${pd ? ` ${pd}` : ""} provide fixed-price written quotes before any work begins - no verbal estimates that shift mid-job. Rates vary by trade: plumbers £40–£70/hour, electricians £45–£75, builders £35–£60, roofers £35–£55. Post your job free on MyApproved and receive up to 3 competitive quotes from insured, ID-checked professionals. No hidden fees, no obligation to accept.`,
    q2: (loc) =>
      `How does MyApproved verify tradespeople before they work in ${loc}?`,
    a2: (loc) =>
      `Every tradesperson listed on MyApproved for work in ${loc} passes a 4-point pre-listing check: (1) government-issued ID verification, (2) public liability insurance confirmation (minimum £2M), (3) trade qualification check (Gas Safe, NICEIC, FENSA, or relevant body where applicable), (4) customer reference screening from confirmed completed projects. Unlike directories that accept self-reported credentials, MyApproved independently verifies each document. Checks are renewed annually.`,
  },
};

export interface AEOContentBlockProps {
  tradeType: string;
  city: string;
  neighborhood?: string;
  postalDistrict?: string;
  averageRating?: number;
  reviewCount?: number;
  className?: string;
}

export default function AEOContentBlock({
  tradeType,
  city,
  neighborhood,
  postalDistrict,
  averageRating = 0,
  reviewCount = 0,
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
            className="text-base sm:text-lg font-extrabold text-[#002FA7] mb-1.5 leading-snug"
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
            className="text-base sm:text-lg font-extrabold text-[#002FA7] mb-1.5 leading-snug"
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
          {averageRating > 0 && (
            <span
              className="inline-flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full text-xs font-semibold text-yellow-800 ring-1 ring-yellow-200"
              itemScope
              itemType="https://schema.org/AggregateRating"
            >
              <span className="text-yellow-500" aria-hidden="true">★</span>
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
              <span itemProp="ratingValue" content={String(averageRating)}>
                {averageRating.toFixed(1)}
              </span>
              <span className="font-normal text-yellow-700">from</span>
              <span itemProp="reviewCount" content={String(reviewCount)}>
                {reviewCount.toLocaleString()}
              </span>
              <span className="font-normal text-yellow-700">verified reviews</span>
            </span>
          )}
          {[
            "Government ID checked",
            "£2M insurance verified",
            "Qualification confirmed",
            "References screened",
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
