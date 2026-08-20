# MyApproved Verification Specification

**Status:** v2. Source of truth. Describes the finished system.
**Owner:** Khamare Clarke
**Last updated:** 19 August 2026

---

## 0. How to use this document

This document defines what "verified" means on MyApproved. It describes the system as it must work when complete, not as it works today.

Four things build from it and nothing else:

1. **Frontend copy.** The hero, the `/verified` page, trade landing pages, the badge, the tradesperson dashboard. No trust claim appears anywhere on the site that is not defined in Section 9.
2. **Backend build.** The check pipeline, decision logic, data model, expiry jobs.
3. **Operations.** Complaints handling, sanctions, investigations, review moderation. Sections 11 to 13.
4. **The badge licence.** What a tradesperson may display and on what conditions.

If a claim is not in this document, it does not go on the site. If a check is not in this document, it is not run.

**Register availability has been researched and is recorded per check.** Where an API is confirmed available, the check is automatable. Where it is not, the check is manual and that is a staffing cost, not a coding problem. Items still marked [CONFIRM] are ones that could not be established from a primary source.

---

## 1. Principles

**Say only what is checked.** Every public claim maps to a specific check. The brand is called "Approved". Under CMA guidance and the DMCC Act, that name raises the evidential bar rather than lowering it.

**Legally mandatory registrations block listing.** Where the law requires a registration to do the work at all, no registration means no listing in that category. Not a flag, not a warning badge. Blocked.

**Verification expires.** Insurance lapses, certificates expire, companies dissolve, people are disqualified. A check that ran once is not a permanent state. The CMA has specifically criticised platforms for one-off vetting that is never refreshed.

**Sole traders are verified to an equivalent standard, by a different route.** Most UK tradespeople are sole traders. A specification that only works properly for limited companies fails the majority of the market and creates a two-tier badge. Section 5 sets out the sole trader route in full.

**Vetting is only one of six obligations.** The CMA's compliance advice for trader recommendation platforms covers vetting, marketing claims, complaints, monitoring, investigations and reviews. A platform with excellent vetting and no complaints process is still non-compliant. Sections 11 to 14 cover the rest.

**A tradesperson can be verified as a business but not certified for a trade.** Separate states. The site must not blur them.

---

## 2. Regulatory context

This section exists so the reasons behind the rules are not lost.

| Instrument | Effect on this platform |
|---|---|
| Digital Markets, Competition and Consumers Act 2024 | Unfair commercial practices provisions in force 6 April 2025. Replaces the CPRs. Prohibits misleading actions and omissions. Fake reviews and undisclosed incentivised reviews are specifically caught |
| CMA compliance advice for Trader Recommendation Platforms, 12 November 2024 | Six principles. Directly addressed to platforms of exactly this type. Updated 28 May 2026 when the CMA wrote to several platforms about their practices |
| Consumer Protection from Unfair Trading Regulations 2008 | Superseded by the DMCC Act for these purposes but the case law remains relevant |
| Gas Safety (Installation and Use) Regulations 1998 | Gas work by an unregistered person is a criminal offence |
| Building Regulations, Part P and the competent person scheme regime | Notifiable work must be self-certified by a scheme member or notified to building control |
| Employers' Liability (Compulsory Insurance) Act 1969 | £5m minimum cover where anyone is employed |
| Control of Asbestos Regulations 2012 | Licensable asbestos work requires an HSE licence |
| Environmental Protection Act 1990 | Waste carriage in the course of business requires registration |
| UK GDPR and Data Protection Act 2018 | Articles 9, 10 and 22 all engaged. See Section 15 |

**The CMA's four stated concerns as of May 2026**, taken from its published update, are the shape of the enforcement risk:

1. Misleading or unsubstantiated claims about trader quality, reliability or suitability
2. Weak vetting, and initial checks that are not kept up to date
3. Inadequate complaints processes
4. Failure to act against problem traders, including failure to ban

This specification is structured to answer all four.

---

## 3. Verification states

| State | Meaning | Badge | Listed |
|---|---|---|---|
| `unverified` | Registered, checks not complete | None | No |
| `pending` | Checks submitted, in progress | None | No |
| `review` | Flagged, awaiting a human decision | None | No |
| `verified` | All Tier A, B and C checks passed | Standard badge | Yes |
| `certified` | Verified, plus all Tier D checks for their categories | Badge with trade credentials shown | Yes |
| `expired` | A time-limited check has lapsed | Revoked | No |
| `suspended` | Under investigation | Revoked | No |
| `restricted` | Listed, but one or more categories removed | Badge, reduced categories | Partially |
| `rejected` | Failed a blocking check | None | No |
| `banned` | Removed permanently. Identity flagged | None | No |

**Only `verified`, `certified` and `restricted` may display the badge.** The badge is revoked automatically on transition to any other state.

`restricted` exists because a tradesperson who lists in four categories and loses one certification should lose that category, not the whole listing. `banned` is separate from `rejected` because a rejected applicant may reapply and a banned one may not.

---

## 4. Check catalogue

Each check records: what it proves, the source, whether it can be automated, what evidence is retained, the pass condition, and how long the result stands.

### Tier A. Identity

Every applicant, every legal structure. Blocking.

| Code | Check | Source | Automatable | Pass condition | Valid for |
|---|---|---|---|---|---|
| A1 | Government photo ID | Passport or UK photocard driving licence | Yes, via IDV provider | Document genuine, unexpired, name matches application | 3 years |
| A2 | Liveness and face match | Selfie video against A1 | Yes, via IDV provider | Match confidence above provider threshold | 3 years |
| A3 | Proof of address | Utility bill, bank statement or council tax, dated within 3 months | Partial | Address matches application | 12 months |
| A4 | Age | Derived from A1 | Yes | 18 or over | Permanent |
| A5 | Right to work in the UK | Home Office share code, or document check | Yes, via a DIATF certified IDV provider | Valid, and any time limit recorded | Per expiry |
| A6 | Sanctions and PEP screening | OFSI consolidated list, UN, EU | Yes, via screening provider | No match | Continuous monitoring |
| A7 | Mobile number | SMS one-time code | Yes | Delivered and confirmed | On change |
| A8 | Email | Verification link | Yes | Confirmed | On change |

**Use a third-party IDV provider for A1, A2 and A5.** Options to price: Stripe Identity, Onfido, Persona, Veriff, Yoti. Stripe Identity is worth costing first because Stripe is already in the stack and it reduces the sub-processor count. For A5, the provider must be certified under the UK Digital Identity and Attributes Trust Framework, because only a certified provider's check gives a statutory excuse on right to work.

**Do not build facial recognition.** Biometric data is special category data under UK GDPR Article 9. A processor with an existing DPIA and appropriate safeguards is materially safer than holding it yourself. Delete the document image after verification and retain only the result, provider reference and date.

---

### Tier B. Business, common to all structures

Blocking.

| Code | Check | Source | Automatable | Pass condition |
|---|---|---|---|---|
| B1 | Legal structure declared | Self-declared, then evidenced | n/a | One of: sole trader, partnership, limited company, LLP |
| B2 | Trading name | Self-declared | Manual | Not misleadingly similar to an existing company, scheme or accreditation body |
| B3 | Business bank account | Open banking, or statement upload | Partial | Account name matches business or applicant name |
| B4 | VAT registration, if claimed | HMRC VAT number checking service | Yes, API believed available [CONFIRM] | Number valid, name matches |
| B5 | Website ownership, if a site is claimed | DNS TXT record or file upload | Yes | Control proven |
| B6 | Trading address | Cross-check against A3 | Manual | Consistent |
| B7 | Duplicate and prior-removal check | Internal | Yes | No match against previously suspended, rejected or banned identities, companies, addresses, phone numbers or bank accounts |

**B7 is the anti-phoenixing check and it matters more than it looks.** Checkatrade runs an equivalent and cites it as one of its twelve. Match on identity, company number, address, phone, email and bank account, not just name. A rogue trader who returns under a new trading name is the single most damaging failure mode for a platform called Approved.

---

### Tier C. Business, by legal structure

#### C1. Limited company and LLP

Blocking. Companies House provides a free public data API. This tier is fully automatable and should be built first.

| Code | Check | Source | Pass condition |
|---|---|---|---|
| C1.1 | Company exists | Companies House API | Company number resolves |
| C1.2 | Company status | Companies House API | `active`. Reject `dissolved`, `liquidation`, `administration`, `receivership`, `voluntary-arrangement` |
| C1.3 | Applicant is an officer or PSC | Companies House officers and PSC endpoints | Applicant name matches a current director or person with significant control |
| C1.4 | Registered office | Companies House API | Present and in the UK |
| C1.5 | SIC codes | Companies House API | At least one plausible for the trade claimed. Mismatch flags for review, does not auto-reject |
| C1.6 | Incorporation date | Companies House API | Recorded. Under 6 months routes to review |
| C1.7 | Filing status | Companies House API | Accounts and confirmation statement not overdue. Overdue routes to review |
| C1.8 | Disqualified directors | Companies House disqualified officers register | No match against the applicant or any current officer |
| C1.9 | Insolvency history of officers | Individual Insolvency Register, Insolvency Service | No current bankruptcy, DRO or IVA against the applicant |
| C1.10 | Charges and mortgages | Companies House API | Recorded. Informational, feeds risk score only |

#### C2. Sole trader and partnership

Blocking. This is the route most applicants will take and it must carry equivalent weight.

There is no single official register of sole traders. That is a fact about the UK, not a gap in this specification. The answer is to verify the same underlying facts through several independent sources rather than one.

| Code | Check | Source | Automatable | Pass condition |
|---|---|---|---|---|
| C2.1 | UTR held | SA302, tax year overview, UTR letter, or self-assessment confirmation | Manual | Document genuine, name matches A1 |
| C2.2 | Trading history | Bank statements, invoices, or filed self-assessment covering at least 6 months | Manual | Evidence of trading for the period claimed |
| C2.3 | Personal insolvency | Individual Insolvency Register, Insolvency Service | Yes, register is public [CONFIRM API] | No current bankruptcy, debt relief order or individual voluntary arrangement |
| C2.4 | County court judgments | Registry Trust, TrustOnline | Yes, commercial API available | Unsatisfied CCJs recorded and scored. Multiple or recent unsatisfied judgments route to review |
| C2.5 | Director disqualification | Companies House disqualified officers register | Yes | No match. A disqualified director trading as a sole trader is lawful but is a material risk signal |
| C2.6 | Prior company history | Companies House officer search by name and date of birth | Yes | Dissolved or liquidated companies in the same trade within 3 years route to review. This is the phoenixing signal for sole traders |
| C2.7 | Business bank account in the trading name | As B3 | Partial | Name match |
| C2.8 | Public presence | Google Business Profile, website, social, trade directories | Partial | Corroborates the trading history claimed in C2.2 |

**Why this is equivalent rather than lesser.** A limited company check proves the company exists and the applicant controls it. The sole trader route proves the person exists (Tier A), has been trading (C2.1, C2.2, C2.7, C2.8), and has no adverse financial or disqualification history (C2.3 to C2.6). Both routes end at the same place: a real, identified, solvent person or entity with a traceable trading history.

**C2.4 and C2.3 apply to limited company applicants too**, run against the named director, because a director's personal insolvency is a signal about the business.

**The site must not present sole traders as less verified.** The `/verified` page states both routes in plain terms. The badge does not distinguish them. What differs is the evidence trail behind them, and that is available on the public record page if anyone wants it.

---

### Tier D. Insurance

Blocking.

| Code | Check | Requirement | Pass condition | Valid for |
|---|---|---|---|---|
| D1 | Public liability | £1m absolute minimum. £2m standard for most trades. £5m required for roofing, scaffolding, asbestos, demolition, structural and any work at height | Certificate in date, insured name matches business, limit meets the category minimum | To policy expiry |
| D2 | Employer's liability | £5m minimum. Legally mandatory where anyone is employed, including casual and temporary staff | Certificate in date, name matches | To policy expiry |
| D3 | Professional indemnity | Required where design, specification, survey or advice is offered. £250k minimum | Certificate in date | To policy expiry |
| D4 | Insurer authorisation | FCA Financial Services Register | Insurer authorised to write the class of business [CONFIRM API] | Per check |
| D5 | Employment declaration | Self-declared at signup, revisited annually | Answered. Drives whether D2 applies | 12 months |

**D2 is a legal obligation, not a preference.** Employers' Liability (Compulsory Insurance) Act 1969. A tradesperson with staff and no EL cover is committing an offence and can be fined up to £2,500 for every day they are uninsured. Ask the employment question explicitly at signup, make it a required field, and revisit it annually. A sole trader with no employees is exempt, and the exemption must be recorded rather than assumed.

**D1 minimums are set by category, not universally.** A tiler needs £1m. A roofer working at height near a public footpath does not. Section 7 records the minimum per category.

**Expiry monitoring is the point of this tier.** A policy checked once and never rechecked is worthless as a public claim and is exactly the failure the CMA named. The system holds the expiry date and acts on it without a human. See Section 8.

**Certificate fraud is real.** Manual review must check the insurer exists and is FCA authorised (D4), the policy number format is plausible, the insured name matches, and the dates are consistent. Where an insurer offers a verification line, use it. Random spot-checks of a sample against the insurer directly are worth the operational cost.

---

### Tier E. Trade certification

Applies by category. Tier E1 is blocking. No registration, no listing in that category.

#### E1. Legally mandatory

| Code | Trade | Register | Legal basis | Availability |
|---|---|---|---|---|
| E1.1 | Any gas work | Gas Safe Register | Gas Safety (Installation and Use) Regulations 1998 | **No public API.** Public web search by 7-digit engineer licence number or 1-6 digit business number. SMS check to 85080. Private API integrations exist by arrangement, so a commercial route is worth pursuing |
| E1.2 | Refrigerant handling, air conditioning, refrigeration, heat pumps | F-Gas certification, company and individual | F-Gas Regulation, retained EU law | Certification body searches, REFCOM and others. No aggregated API [CONFIRM] |
| E1.3 | Licensable asbestos work | HSE asbestos licence | Control of Asbestos Regulations 2012 | HSE publishes a licence holder list. No API [CONFIRM] |
| E1.4 | Waste carriage in the course of business | Environment Agency waste carrier, broker and dealer registration | Environmental Protection Act 1990 | **Free open API confirmed.** Environment Agency open ePR, no registration required, Environment Agency Conditional Licence applies. Returns status, tier and expiry |
| E1.5 | Scaffolding erection | CISRS card | Work at Height Regulations 2005 | Card check, manual |
| E1.6 | Work on public water supply | Approved contractor under WaterSafe or a water company scheme | Water Supply (Water Fittings) Regulations 1999 | WaterSafe search, no API [CONFIRM] |

**Gas is the largest single liability on this platform.** If one check is built properly first, it is E1.1. Manual verification against the public register with a screenshot retained as evidence is acceptable at launch. Pursue a formal data arrangement with Gas Safe Register as a priority, since one already exists for at least one compliance platform.

**Do not scrape any of these registers.** Check the terms of each before automating. The Environment Agency explicitly licenses its data. Others do not.

**The Environment Agency logo may not be displayed** by registered carriers or by this platform. The EA has stated that use of its logo to imply registration or endorsement is an infringement of its intellectual property. Link to the register entry instead.

#### E2. Competent person schemes, required for notifiable building work

Building Regulations require notifiable work to be either self-certified by a member of an authorised competent person scheme or notified to local authority building control. Blocking for the categories listed.

There are roughly twenty authorised schemes, not four. The scheme list is maintained by government and changes. Schemes are authorised per work type, so scheme name alone is insufficient, the scope must match the work.

| Code | Work type | Authorised schemes include | Availability |
|---|---|---|---|
| E2.1 | Electrical installation in dwellings, Part P | NICEIC and ELECSA (both Certsure LLP), NAPIT, STROMA, APHC, BESCA, Blue Flame, Benchmark | Individual scheme searches. `competentperson.co.uk` aggregates. No API [CONFIRM] |
| E2.2 | Replacement windows, doors, roof windows and rooflights | FENSA, CERTASS, ASSURE (Network VEKA), Certsure, NAPIT, STROMA, BM TRADA, BSI, Blue Flame | Individual scheme searches. FENSA has a public installer search |
| E2.3 | Oil-fired appliances and oil storage | OFTEC, APHC, BESCA, Blue Flame, Certsure, NAPIT, STROMA | OFTEC public search |
| E2.4 | Solid fuel, stoves, biomass, chimneys | HETAS, APHC, BESCA, Blue Flame, Certsure, NAPIT, OFTEC, STROMA | HETAS public search |
| E2.5 | Roof coverings, pitched and flat | CompetentRoofer (NFRC), NAPIT | CompetentRoofer search |
| E2.6 | Heating and hot water systems | APHC, BESCA, Blue Flame, Gas Safe, Certsure, HETAS, NAPIT, OFTEC, STROMA | Per scheme |
| E2.7 | Unvented hot water systems, G3 | G3 qualification, or a scheme covering it | Certificate upload |
| E2.8 | Cavity wall insulation | CIGA, BBA | Per scheme |
| E2.9 | Ventilation and air conditioning systems | BESCA, NAPIT, STROMA | Per scheme |

**Store the scheme name and the registration number, not just a boolean.** The public claim must name the scheme, because "certified" without a named scheme means nothing and is not permitted under Section 9.

**Verify scope, not just membership.** A NAPIT registration covering electrical does not cover roofing. The scheme record states the work types. Record them.

#### E3. Grant and tariff schemes

| Code | Scheme | When required |
|---|---|---|
| E3.1 | MCS certification | Solar PV, heat pumps, biomass, solar thermal, where the work is grant-funded, eligible for the Boiler Upgrade Scheme, or connected to an export tariff |
| E3.2 | TrustMark registration | Required alongside MCS for most government-backed retrofit schemes |
| E3.3 | PAS 2030 and PAS 2035 | Retrofit and energy efficiency work under government schemes |

Blocking where the tradesperson advertises grant-funded work. Not blocking otherwise.

#### E4. Quality marks, display only

Never a listing condition, never described as verification.

Trade association memberships (FMB, NFRC, NAPIT, APHC, CIPHE), Which? Trusted Traders, TrustMark outside E3, CSCS cards, manufacturer accreditations (Worcester Bosch, Vaillant, Velux), City & Guilds and NVQ qualifications, MLA for locksmiths, Safe Contractor, CHAS, Constructionline.

These are displayed where evidenced. They do not gate a listing.

---

### Tier F. Presence, history and reputation

Non-blocking. Feeds the risk score and routes to review.

| Code | Check | Source | Signal |
|---|---|---|---|
| F1 | Google Business Profile exists | Google Places API | Profile found for the business name and area |
| F2 | Name, address and phone consistency | Places API against the application | NAP matches Companies House or A3. Mismatch routes to review |
| F3 | Profile claimed by the owner | Google Business Profile API, owner OAuth | Ownership proven |
| F4 | Profile age against review volume | Places API | A profile under 3 months old with a high review count is a fraud signal |
| F5 | Review authenticity | Manual scan | Clustered dates, duplicated phrasing, single-review reviewer accounts |
| F6 | Adverse media and open source | Manual and automated search | Prosecutions, Trading Standards action, local press. Checkatrade runs an equivalent check |
| F7 | Third-party platform reviews | Manual | Existing presence on other directories and what it says |
| F8 | Companies House filing history pattern | Companies House API | Repeated late filings, multiple dissolved companies |

**Cost control on F1, F2 and F4.** Every Places API call carries an explicit field mask restricted to the Essentials tier and a hard call ceiling. Requesting `rating` or `userRatingCount` moves the call to the Enterprise SKU. This is the £128 lesson. It goes in the code, not in someone's memory.

**F6 is not optional in practice.** The CMA expects platforms to take reasonable steps to identify problem traders before listing them, and a search of public records and local press is the cheapest such step.

---

### Tier G. Optional, evidenced where held

| Code | Check | Notes |
|---|---|---|
| G1 | Basic DBS | Lawful for anyone to obtain about themselves. Relevant for work in occupied homes. Not mandatory, never a listing condition, displayed only where the tradesperson supplies it |
| G2 | Health and safety qualification | SSSTS, SMSTS, IOSH, first aid |
| G3 | Asbestos awareness training | Category 1 non-licensed work |
| G4 | Trade association membership | As E4 |
| G5 | Manufacturer accreditation | As E4 |
| G6 | Apprenticeship or NVQ certificates | Evidenced by certificate upload |

**Enhanced DBS is not requested and never displayed.** It is only available where the role is regulated activity. Domestic trade work is not regulated activity. Requesting it would be unlawful, and any platform claiming its trades are enhanced-DBS checked is either wrong or describing something else.

---

## 5. Sole trader parity, stated plainly

This section exists because it is the most likely thing to be got wrong.

**What a limited company applicant provides:** Tier A, Tier B, Tier C1, Tier D, Tier E as applicable, Tier F.

**What a sole trader provides:** Tier A, Tier B, Tier C2, Tier D, Tier E as applicable, Tier F.

Tier E is identical. A gas engineer is Gas Safe registered or is not listed, whether they trade through a company or not. The law does not care about legal structure and neither does this specification.

Tier D is identical except that D2 falls away for a sole trader with no employees, and that exemption is recorded against the D5 declaration rather than assumed.

Tier C is where the routes differ, and both routes prove the same four things:

| What must be proven | Limited company | Sole trader |
|---|---|---|
| The business is real and traceable | C1.1, C1.2, C1.4 | C2.1, C2.2, C2.7 |
| The applicant controls it | C1.3 | A1 plus C2.1 name match |
| No adverse financial history | C1.7, C1.9, C1.10 | C2.3, C2.4 |
| No disqualification or phoenixing | C1.8, B7 | C2.5, C2.6, B7 |

**On the site, both are "Identity checked" and "Business verified".** The difference in evidence is shown on the public record page, not in the badge.

---

## 6. Trade categories and required checks

Every category requires all of Tier A, Tier B, the applicable Tier C, and D1. The table records what is added, the public liability minimum, and any scope restriction.

| Category | Adds | PL minimum | Blocking |
|---|---|---|---|
| Gas engineer, boiler, central heating | E1.1 Gas Safe | £2m | Yes |
| Plumber, no gas work | E2.7 G3 if unvented hot water | £2m | Conditional |
| Plumber, with gas | E1.1 Gas Safe | £2m | Yes |
| Electrician | E2.1 competent person scheme | £2m | Yes for notifiable work |
| Air conditioning and refrigeration | E1.2 F-Gas, company and individual | £2m | Yes |
| Heat pump installer | E1.2 F-Gas, E3.1 MCS if grant-funded | £2m | Yes |
| Solar PV and solar thermal | E3.1 MCS if grant-funded or export tariff, E2.1 for the electrical work | £2m | Conditional |
| EV charger installer | E2.1 competent person scheme, OZEV approval if grant-funded | £2m | Yes |
| Roofer | E1.4 waste carrier, E2.5 CompetentRoofer | £5m | Waste carrier yes |
| Builder, extensions, structural | E1.4 waste carrier | £5m | Yes |
| Groundworks and drainage | E1.4 waste carrier | £5m | Yes |
| Demolition | E1.4 waste carrier, E1.3 if asbestos present | £5m | Yes |
| Window, door and glazing fitter | E2.2 FENSA, CERTASS or equivalent | £2m | Yes for replacements |
| Oil-fired heating | E2.3 OFTEC or equivalent | £2m | Yes |
| Stove, chimney and solid fuel installer | E2.4 HETAS or equivalent | £2m | Yes |
| Chimney sweep | None mandatory. HETAS or NACS displayed if held | £1m | No |
| Asbestos removal | E1.3 HSE licence | £5m | Yes |
| Scaffolder | E1.5 CISRS, and a design where required | £5m | Yes |
| Plasterer, renderer | None beyond base | £1m | No |
| Painter and decorator | None beyond base | £1m | No |
| Tiler | None beyond base | £1m | No |
| Carpenter and joiner | None beyond base | £1m | No |
| Kitchen fitter | E2.1 if electrical work is included, E1.1 if gas | £2m | Conditional |
| Bathroom fitter | E2.7 if unvented, E2.1 if electrical | £2m | Conditional |
| Flooring fitter | None beyond base | £1m | No |
| Locksmith | MLA displayed if held. No mandatory registration | £1m | No |
| Security and alarm installer | NSI or SSAIB displayed if held. SIA licence only where guarding is offered | £2m | Conditional |
| Landscaper and gardener | E1.4 waste carrier where waste is removed | £2m | Conditional |
| Tree surgeon and arborist | E1.4 waste carrier, NPTC or City & Guilds chainsaw certificates | £5m | Yes |
| Fencing and decking | E1.4 waste carrier where waste is removed | £1m | Conditional |
| Driveway and paving | E1.4 waste carrier | £2m | Yes |
| Damp proofing and timber treatment | PCA membership displayed if held. Pesticide certificates where used | £2m | Conditional |
| Pest control | BPCA or NPTA displayed. Certificates for pesticide use | £2m | Conditional |
| Drainage and septic tank | E1.4 waste carrier, environmental permit for some discharge work | £5m | Yes |
| Insulation and cavity wall | E2.8 CIGA or BBA, E3.2 TrustMark and PAS 2030 for scheme work | £2m | Conditional |
| Cleaner, domestic | None beyond base | £1m | No |
| Removals and clearance | E1.4 waste carrier | £2m | Yes |
| Handyman | Scope restriction, see below | £1m | Restriction |
| Architectural and design services | D3 professional indemnity | £1m plus PI | Yes |

**Handyman is the loophole and it must be closed explicitly.** Without a restriction, "handyman" becomes the route to unregulated gas and electrical work. The category carries a scope limit that is enforced in the listing and shown to homeowners:

> Handyman listings cover minor repairs and maintenance only. They may not carry out gas work, notifiable electrical work, work on unvented hot water systems, refrigerant handling, asbestos work, or structural alterations. A handyman offering any of these must register in that specific category and hold the required certification.

**Any category may be added later, but not without completing this table.** A new category with no entry here has no defined check set and cannot be listed.

---

## 7. Decision logic

Runs when an application is complete, and again on every re-verification event.

```
FOR each required check in the applicant's category set:

  IF check is BLOCKING and result is FAIL:
      state = rejected
      record reason and check code
      offer human review route (Article 22)
      STOP

  IF check is BLOCKING and result is INDETERMINATE:
      state = review
      route to admin queue with reason
      STOP

  IF check is NON-BLOCKING and result is FAIL:
      risk_score += weight
      continue

IF risk_score >= REVIEW_THRESHOLD:
    state = review
ELSE IF all Tier E checks for every claimed category passed:
    state = certified
ELSE IF all Tier E checks passed for some categories only:
    state = restricted
    list only the categories that passed
ELSE:
    state = verified
```

**Risk weights. Starting values, to be tuned against outcomes.**

| Signal | Weight |
|---|---|
| Previously suspended or banned identity match | 100 |
| Undischarged bankruptcy or current IVA | 60 |
| Director disqualification match | 60 |
| Adverse media, substantiated | 50 |
| Two or more dissolved companies in the same trade within 3 years | 40 |
| Google Business Profile under 3 months old with 20 or more reviews | 30 |
| Unsatisfied CCJ within 12 months | 25 |
| Applicant not listed as an officer or PSC | 25 |
| Companies House filings overdue | 20 |
| Name, address and phone mismatch against Google | 20 |
| Company incorporated under 6 months | 15 |
| Proof of address does not match registered office | 15 |
| Insurance expiring within 30 days | 10 |
| SIC codes inconsistent with the trade claimed | 10 |
| No Google Business Profile found | 10 |

`REVIEW_THRESHOLD = 30`

**The admin queue is the exception path, not the default.** If more than roughly a quarter of applications land in review, the thresholds are wrong or the automation is incomplete. Track the figure weekly.

**No application is auto-rejected without a human review route being offered.** Article 22. See Section 15.

---

## 8. Re-verification and expiry

The system holds an expiry date for every time-limited check and acts on it without a human. The CMA has specifically criticised platforms whose initial checks are never refreshed.

| Trigger | Action |
|---|---|
| Insurance expiry minus 30 days | Email reminder |
| Insurance expiry minus 7 days | Second reminder, dashboard banner |
| Insurance expiry reached | State to `expired`, delist, badge revoked |
| Certification expiry minus 30 days | Reminder |
| Certification expiry reached | Category removed. State to `restricted` if other categories remain, `expired` if not |
| Proof of address at 12 months | Re-upload required |
| Employment declaration at 12 months | Re-confirmation required, drives D2 |
| ID check at 3 years | Full re-verification |
| Monthly | Re-poll Companies House status, officers and filing status for all limited company members |
| Monthly | Re-run sanctions and PEP screening |
| Quarterly | Re-check every trade register where a search route exists |
| Quarterly | Re-run insolvency and CCJ checks |
| Annually | Full re-verification of the whole check set |
| Immediate | Companies House status change to dissolved, liquidation, administration or receivership |

**Companies House offers a streaming API for change events.** If available on reasonable terms it removes the need for monthly polling and gives near-real-time suspension on dissolution. Confirm before building the polling job, because building both is wasted work.

**Quarterly trade register re-checks are manual where no API exists**, which is most of them. Budget the operational time. At 500 members this is a part-time role. At 5,000 it is a team, or a data arrangement with the schemes.

---

## 9. What the site may claim

This is the complete list of public claims MyApproved may make. It describes the finished system. Every claim is permitted once the check behind it runs.

Three rules govern all of it:

1. **A claim may only appear where its check has passed for that tradesperson.** Not sitewide, unless the check blocks listing in every category.
2. **A claim is written per tradesperson, not per platform**, unless it describes a platform rule that is enforced in code.
3. **Where a register issues a number, the number is shown.** A registration claim without the number is weaker and easier to fake.

### 9.1 Identity

| Claim | Check | Shown when |
|---|---|---|
| "Identity checked" | A1, A2 | Both passed |
| "Photo ID verified against a live selfie" | A1, A2 | Both passed |
| "Address confirmed" | A3 | Passed, within 12 months |
| "Right to work in the UK confirmed" | A5 | Passed |
| "Screened against UK and international sanctions lists" | A6 | Passed, monitoring active |

Nothing implying criminal record checking. Tier A is identity, not character.

### 9.2 Business

| Claim | Check | Shown when |
|---|---|---|
| "Companies House verified" | C1.1, C1.2 | Limited companies and LLPs. Company active |
| "Company number [X], active at Companies House" | C1.1, C1.2 | Number displayed |
| "Confirmed as a director of the business" | C1.3 | Officer or PSC match |
| "Checked against the disqualified directors register" | C1.8 or C2.5 | Passed |
| "Checked against the Individual Insolvency Register" | C1.9 or C2.3 | Passed |
| "Trading history confirmed" | C2.2 | Sole traders. Evidence covering at least 6 months |
| "Registered as a sole trader, tax reference confirmed" | C2.1 | Sole traders. Never display the UTR itself |
| "Registered for VAT, number [X]" | B4 | Passed, number valid |
| "Business bank account confirmed in the trading name" | B3 | Name match passed |
| "Website ownership confirmed" | B5 | Passed |
| "Business verified" | Full Tier C for their structure | All applicable Tier C passed. Use for both routes |

### 9.3 Insurance

| Claim | Check | Shown when |
|---|---|---|
| "Public liability cover of £[X]m, confirmed and monitored" | D1 | In date, name matched, meets the category minimum |
| "Public liability insurance confirmed and monitored" | D1 | Where the limit is not being displayed |
| "Employer's liability insurance of £[X]m confirmed" | D2 | Where they employ anyone |
| "No employees, employer's liability not required" | D5 | Where the declaration says so |
| "Professional indemnity insurance confirmed" | D3 | Where design or advice is offered |
| "Insurer confirmed as FCA authorised" | D4 | Passed |
| "Cover is monitored and the listing is withdrawn if it lapses" | D1 to D3 with Section 8 | Always, where insurance applies |

Never the word "insured" alone. Always the cover type, and the limit where held.

### 9.4 Trade certification, legally mandatory

| Claim | Check |
|---|---|
| "Gas Safe registered, number [X]" | E1.1 |
| "F-Gas certified, company and engineer" | E1.2 |
| "HSE asbestos licence held, number [X]" | E1.3 |
| "Registered waste carrier, Environment Agency number [X]" | E1.4 |
| "CISRS carded scaffolder" | E1.5 |
| "WaterSafe approved contractor" | E1.6 |

Platform-level statements of the rule are permitted where the rule is enforced in code, for example: "Gas engineers cannot list on MyApproved without a current Gas Safe registration."

### 9.5 Trade certification, competent person schemes

| Claim | Check |
|---|---|
| "Part P registered electrician, [scheme name], number [X]" | E2.1 |
| "[FENSA or CERTASS] registered, number [X]" | E2.2 |
| "OFTEC registered, number [X]" | E2.3 |
| "HETAS registered, number [X]" | E2.4 |
| "CompetentRoofer registered, number [X]" | E2.5 |
| "G3 qualified for unvented hot water" | E2.7 |
| "MCS certified, number [X]" | E3.1 |
| "TrustMark registered, number [X]" | E3.2 |

The scheme must always be named. "Certified" or "scheme registered" without naming the scheme is not permitted. Where the scheme's registration covers specific work types, the claim is limited to those work types.

### 9.6 Presence and history

| Claim | Check |
|---|---|
| "Google Business Profile confirmed" | F1 |
| "Business name, address and phone verified as consistent" | F2 |
| "Business profile claimed by the owner" | F3 |
| "Public records checked" | F6 |

Do not state or imply a review count is verified unless F5 has been run on that profile.

### 9.7 Optional credentials

Displayed only where held. Never a platform claim, never a listing condition.

"Holds a basic DBS certificate, issued [date]" (G1), "Member of [association]" (G4), "[Manufacturer] approved installer" (G5), "Holds [qualification]" (G2, G6).

### 9.8 Monitoring

| Claim | Basis |
|---|---|
| "Companies House status is re-checked monthly" | Section 8 |
| "Sanctions screening runs monthly" | Section 8 |
| "Trade registrations are re-checked quarterly" | Section 8 |
| "Insurance expiry is tracked and cover is re-confirmed at renewal" | Section 8 |
| "Identity is re-verified every three years" | Section 8 |
| "Every member is fully re-verified annually" | Section 8 |
| "Verification is withdrawn automatically when cover or certification lapses" | Sections 8 and 12 |
| "A member whose company is dissolved is suspended immediately" | Sections 8 and 12 |

"Checks re-run monthly" as a blanket claim is not permitted. Only some checks are monthly.

### 9.9 Platform-level claims

True once the rules are enforced in code.

- "No tradesperson is listed until identity, business and insurance checks have passed."
- "Gas, electrical, oil, solid fuel, glazing, refrigeration, asbestos, scaffolding and waste-carrying work all require the relevant registration before a tradesperson can list in that category."
- "Verification is withdrawn automatically when cover or certification lapses."
- "Every check is time-limited and re-run."
- "Sole traders and limited companies are both verified, by routes suited to each."
- "Every member is re-verified in full once a year."

### 9.10 Not permitted, under any wording

- "Fully vetted", "fully verified", "100% verified". Vague and unfalsifiable
- "Guaranteed" anything, unless a guarantee product actually exists and its terms are published
- "Insured" without cover type and limit
- "Background checked", "criminally checked", "DBS checked" as a platform claim
- "Enhanced DBS" in any context
- "Approved by [any body]". MyApproved is not accredited by anyone
- "Trade qualified" or "qualifications confirmed" as a general claim. Only where a specific named certificate has been checked
- "Reference checked" unless a reference check is added to this specification
- "Vetted", "pre-vetted", "screened" used loosely. Name the actual check
- "Face-to-face interview", "video interview". No interview step exists
- Any numbered process claim such as "7-step verification" that does not map to the tiers in Section 4
- Any claim about a check that has not been run on that specific tradesperson
- Any claim that verification guarantees the quality of workmanship

### 9.11 The word "Approved"

The brand name is not a claim and must not be used as one. "MyApproved tradespeople" describes who is listed. "Approved tradespeople" without the brand implies accreditation by an approving body and is not permitted.

### 9.12 Required disclaimers

Every page carrying trust claims links to `/verified`. That page states, in plain English and without hedging:

- What is checked, grouped by identity, business, insurance and trade certification
- That verification is not a guarantee of workmanship or of any particular outcome
- That homeowners should still obtain written quotes, agree terms in writing, and check the work
- How often each check is re-run
- When and why verification is withdrawn
- How to complain about a member, and what MyApproved will do about it

---

## 10. The public record page

Every verified member has a page at `/verified/{slug}` showing:

- Current state and the date it was reached
- Every check that has passed, with the date and, where a register issues one, the registration number and a link to the public register entry
- Every check that is pending or not applicable, stated as such
- Categories they are listed in, and the scope restrictions on those categories
- The date of the next scheduled re-verification
- Whether they are a sole trader or a limited company, and what that means

This page is what makes the badge checkable rather than decorative. It is also the honest answer to any regulator asking what a claim is based on.

**It states what is not checked as prominently as what is.**

---

## 11. Complaints

CMA principle 3. A platform with no accessible complaints route is non-compliant regardless of how good its vetting is.

**Requirements**

- A complaint form reachable from every member profile, the footer, and the homepage in no more than two clicks
- No account required to complain
- Acknowledgement within 1 working day, automated
- Substantive response within 5 working days
- A stated escalation route if the complainant is unsatisfied
- Complaints logged against the member record and visible to the vetting team
- Complaint volume and outcome feed the risk score and the annual re-verification
- Published, plain-English summary of the process and of what MyApproved can and cannot do

**What MyApproved does not do:** adjudicate contractual disputes, guarantee work, or hold money in escrow, unless and until those products exist. The complaints page says so.

---

## 12. Sanctions and investigations

CMA principles 4 and 5. The CMA's May 2026 concern was platforms lacking the measures to act against problem traders, including banning.

**Investigation triggers**

- Any complaint alleging unsafe or illegal work
- Any complaint alleging misrepresentation of credentials
- Two or more complaints within 6 months
- Adverse media or Trading Standards contact
- Failed re-verification of a blocking check
- Suspected fake reviews
- Badge displayed after revocation

**Sanction ladder**

| Sanction | When |
|---|---|
| Written warning | First substantiated minor complaint |
| Category restriction | Certification lapsed or scope exceeded |
| Suspension pending investigation | Unsafe work alleged, credentials in doubt |
| Delisting | Failed blocking check, unresolved after notice |
| Permanent ban, identity flagged | Falsified documents, illegal work, repeat offending, fake reviews |

**Immediate suspension, badge revoked, delisted**

- Any Tier A, B, C, D or E1 check fails on re-verification
- Companies House status becomes dissolved, liquidation, administration or receivership
- Insurance lapses and is not replaced within the notice period
- Trade certification withdrawn by the issuing body
- Sanctions or PEP match arises
- Substantiated complaint of unsafe or illegal work
- Evidence of falsified documents. Permanent ban, identity flagged in B7
- Evidence of fake reviews. DMCC Act
- Badge displayed after revocation

**Every sanction is recorded with the reason, the evidence, the decision-maker and the date.** Sanctions data is what B7 checks against, and it is the record that would be produced if the CMA asked.

---

## 13. Reviews

CMA principle 6, and the DMCC Act. Only relevant if MyApproved displays reviews. If it does, these are obligations, not options.

- Reviews only from customers with a verifiable completed job through the platform
- Verification of the reviewer by SMS or email at minimum
- No incentivised reviews without prominent disclosure
- No suppression of negative reviews, and no ability for a member to remove one
- Right of reply for the member
- Fake review detection: clustered timing, duplicated phrasing, single-review accounts, IP and device signals
- A published policy on how reviews are moderated and what gets removed
- Removal of reviews found to be fake, with the member sanctioned under Section 12

**Soliciting, writing, incentivising or hosting fake reviews is a civil offence under the DMCC Act 2024.** The platform is liable for taking reasonable steps, not merely for its own conduct.

**Decision still open:** whether MyApproved displays reviews at all at launch. If it does not, say so plainly rather than leaving empty review sections that imply they exist.

---

## 14. Badge

A badge on a tradesperson's own site is a stronger claim than the same words on yours, because it travels and reads as third-party endorsement.

**Serve it dynamically. Do not hand over a file.**

```
GET /badge/{token}.svg
```

The endpoint checks state on every request. State is `verified`, `certified` or `restricted`, it returns the badge. Anything else, it returns a transparent 1x1. Revocation is then real rather than an email asking someone to take it down.

The badge links to `/verified/{slug}`, the public record. That link makes it checkable, and it is the backlink.

**Badge licence terms, to sit in the tradesperson terms of service**

- Personal, non-transferable, terminates automatically on revocation
- Must link to the member's public record page. Unlinked use is prohibited
- No alteration of colour, proportion, wording or aspect ratio
- No use implying MyApproved endorses specific work or guarantees outcomes
- No use in a category the member is not certified in
- Removal required within 24 hours of notice
- Continued display after revocation is a ground for permanent ban and, if it continues, trade mark enforcement

---

## 15. Data protection

| Item | Position |
|---|---|
| Lawful basis, verification | Legitimate interests. DPIA required, LIA documented before launch |
| Lawful basis, sanctions screening | Legal obligation and substantial public interest |
| Special category data | Biometric data in A2. Article 9 condition required. Processor DPA required. Do not retain the image |
| Criminal offence data | Basic DBS in G1. Article 10 and DPA 2018 Schedule 1 condition required. Do not retain the certificate image, record only the issue date and reference |
| ID document retention | Delete the image after verification. Retain the result, provider reference and date |
| Insurance certificates | Retain to expiry plus 6 years, the limitation period |
| Rejected applications | Retain the decision, reason and check codes for 12 months. Delete supporting documents at 30 days |
| Banned members | Retain identity match data indefinitely for B7, on legitimate interests, documented in the LIA |
| Complaints | Retain for 6 years |
| Sub-processors | IDV provider, Companies House, Registry Trust, Insolvency Service, Google, Stripe, Supabase, Vercel, GoHighLevel, Gemini, and the email and SMS providers. All named in the privacy policy |
| Data location | UK or adequacy-covered only |
| Automated decision-making | Auto-rejection is a decision with legal or similarly significant effect under Article 22. A human review route must exist and be offered at the point of rejection |

**Article 22 is the one that catches people.** If the system auto-rejects without a human, the applicant has the right to contest it and obtain human intervention. Build the appeal route with the decision engine, not after the first complaint.

**The DPIA must be done before the first real applicant.** It covers biometric processing, criminal offence data, automated decision-making and large-scale processing of identity documents. Any one of those triggers it.

---

## 16. Data model

Field names indicative.

**`verification_profiles`**
`id`, `tradesperson_id`, `legal_structure`, `state`, `risk_score`, `submitted_at`, `decided_at`, `decided_by`, `review_reason`, `appeal_status`, `next_full_reverification_at`

**`verification_checks`**
`id`, `profile_id`, `check_code`, `status`, `method`, `source`, `evidence_ref`, `result_payload` (jsonb), `registration_number`, `scheme_name`, `checked_at`, `expires_at`, `checked_by`

**`verification_documents`**
`id`, `profile_id`, `check_code`, `storage_path`, `mime`, `uploaded_at`, `delete_after`, `deleted_at`

**`trade_categories`**
`id`, `slug`, `name`, `required_checks`, `blocking_checks`, `pl_minimum`, `scope_restriction`

**`member_categories`**
`id`, `profile_id`, `category_id`, `state`, `certified_at`, `restricted_reason`

**`badge_tokens`**
`id`, `tradesperson_id`, `token`, `issued_at`, `revoked_at`

**`complaints`**
`id`, `profile_id`, `complainant_contact`, `job_ref`, `category`, `body`, `received_at`, `acknowledged_at`, `responded_at`, `outcome`, `sanction_id`

**`sanctions`**
`id`, `profile_id`, `type`, `reason`, `evidence_ref`, `decided_by`, `effective_from`, `lifted_at`

**`banned_identities`**
`id`, `identity_hash`, `company_numbers`, `addresses`, `phones`, `emails`, `bank_account_hashes`, `reason`, `banned_at`

**Requirements**

- `verification_checks` is append-only. Never update a row, insert a new one. The history is the audit trail
- `expires_at` is indexed. The expiry job scans it
- Every state transition is logged with actor and reason
- The badge endpoint validates the token and current state on every request
- `banned_identities` is checked at signup, before any other processing

---

## 17. Build order

1. **Companies House automation.** Free API, confirmed available, highest value. C1.1 to C1.10
2. **Insurance document flow.** Upload, expiry capture, reminder job, manual review. Tier D
3. **Sole trader route.** C2. Registry Trust and Insolvency Service integrations, manual document review for C2.1 and C2.2
4. **IDV provider integration.** Tier A. Choose a DIATF-certified provider so A5 is covered
5. **Environment Agency waste carrier.** E1.4. Free open API, quick win, covers a large share of categories
6. **Gas Safe.** E1.1. Manual against the public register at first. Pursue a data arrangement in parallel
7. **Decision engine and risk scoring.** Section 7, with the Article 22 appeal route built at the same time
8. **Badge endpoint and public record page.** Sections 10 and 14
9. **Expiry and re-verification jobs.** Section 8
10. **Complaints and sanctions.** Sections 11 and 12. Required before launch, not after
11. **Remaining competent person schemes.** E2, manual where no API exists
12. **Tier F scoring signals.** Places API with field masks and call ceilings

**Steps 1 to 6, plus 10, are the minimum to launch honestly with the claims in Section 9.** Steps 7 to 9 can follow if the manual process is genuinely being run in the meantime and the claims are limited accordingly.

---

## 18. Open items

Register and API confirmation:

- [ ] Companies House streaming API terms and availability
- [ ] HMRC VAT number checking API access
- [ ] FCA Financial Services Register API access
- [ ] Registry Trust CCJ search commercial terms
- [ ] Individual Insolvency Register programmatic access
- [ ] Gas Safe Register data arrangement, commercial terms
- [ ] F-Gas certification body searches, which bodies and what access
- [ ] HSE asbestos licence holder list, format and access
- [ ] Competent person scheme searches, per scheme, and whether `competentperson.co.uk` offers any data route
- [ ] Google Business Profile API for F3 owner verification

Commercial and legal:

- [ ] Price IDV providers. Confirm DIATF certification for right to work
- [ ] DPIA for the verification pipeline
- [ ] Legitimate interests assessment, including for `banned_identities`
- [ ] Article 22 appeal process, written and staffed
- [ ] Tradesperson terms of service including the badge licence, solicitor-drafted
- [ ] Decide whether reviews are displayed at launch
- [ ] Insurance minimums in Section 6 reviewed by a broker
- [ ] Complaints process reviewed against the CMA compliance advice
- [ ] Trade mark filing, figurative mark, before advertising begins

Operational:

- [ ] Staffing model for manual checks at 100, 500 and 5,000 members
- [ ] Weekly review-queue percentage tracking
- [ ] Spot-check process for insurance certificates
