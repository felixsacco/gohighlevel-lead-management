# 📋 MyApproved.com - Competitor Claims Register

Under the Digital Markets, Competition and Consumers Act 2024 and CMA directives, all comparative business claims must be fully substantiated with dated evidence. The following competitor comparison claims have been extracted from the codebase to await verification, dated evidence substantiation, or rewriting by the owner.

---

## 1. Trust & Verification Claims

The following claims compare MyApproved's verification pillars with Checkatrade, MyBuilder, and MyJobQuote.

### 1.1 Government-Issued ID Verification
* **Claim:** `"Self-declared. Checkatrade does not independently verify identity documents against official records."`
* **File & Line:** `components/TrustEngineSection.tsx` (Line 16)
* **Status:** flagged for review. Needs confirmation of Checkatrade's current ID policy.

### 1.2 Public Liability Insurance Confirmation
* **Claim:** `"Self-uploaded. MyBuilder and Checkatrade accept insurance certificates without independent insurer confirmation."`
* **File & Line:** `components/TrustEngineSection.tsx` (Line 24)
* **Status:** flagged for review. Needs confirmation of Checkatrade and MyBuilder's current insurance verification workflows.

### 1.3 Trade Qualification Check
* **Claim:** `"Checkatrade states tradespeople 'may' hold relevant qualifications. MyJobQuote does not verify regulated trade credentials."`
* **File & Line:** `components/TrustEngineSection.tsx` (Line 32)
* **Status:** flagged for review. Needs verification of Checkatrade and MyJobQuote terms of service.

### 1.4 Customer Reference Screening
* **Claim:** `"Checkatrade reviews can be left by anyone, not just confirmed customers. Review authenticity is not independently verified."`
* **File & Line:** `components/TrustEngineSection.tsx` (Line 40)
* **Status:** flagged for review. Checkatrade's review verification and approval policies must be checked.

---

## 2. Pricing & Commercial Structure Claims

The following claims compare subscription costs and lead costs.

### 2.1 Fixed Monthly Subscriptions
* **Claim 1:** `"Checkatrade charges £300+/month regardless of lead volume."`
  - *File & Line:* `app/for-tradespeople/page.tsx` (Line 29)
* **Claim 2:** `"Stop paying £300/month to Checkatrade for a subscription that runs regardless of how many leads you get."`
  - *File & Line:* `app/for-tradespeople/page.tsx` (Line 155)
* **Claim 3:** `"Checkatrade / month: £300+"`
  - *File & Line:* `app/for-tradespeople/page.tsx` (Line 167) & `components/TrustEngineSection.tsx` (Line 86)
* **Status:** flagged for review. Standard Checkatrade subscription fees must be audited.

### 2.2 Shared Leads & Lead Distribution
* **Claim 1:** `"Your lead is matched to you based on trade and location. MyBuilder sells the same lead to multiple competing trades. MyApproved does not."`
  - *File & Line:* `app/for-tradespeople/page.tsx` (Line 41)
* **Claim 2:** `"Variable lead cost up to £80. Same lead sold to multiple competing trades simultaneously."`
  - *File & Line:* `components/TrustEngineSection.tsx` (Line 94)
* **Status:** flagged for review. Verify MyBuilder and MyJobQuote lead-sharing terms.
