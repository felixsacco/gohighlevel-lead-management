import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendProfileApprovedEmail } from '@/lib/notifications/approval-email';
import { getCompanyProfile } from '@/lib/companies-house';
import { aiVerifyTradesperson } from '@/lib/verification/ai-verify';
import { evaluateVerificationState } from '@/lib/verification/user-status-machine';
import { REVIEW_THRESHOLD } from '@/lib/verification/spec';
import { verifyAdminSecret } from '@/lib/auth/admin-guard';

// Phase 2 (P1) — zero-touch vetting. This route no longer force-approves on an
// unconditional admin click. "approved" is now a deterministic machine verdict
// and the route *returns* a status instead of *setting* one:
//
//   approved  = evaluateVerificationState (every required document approved and
//               unexpired insurance)  AND  Companies House status 'active' (only
//               when a company_number is on the record)  AND  AI riskScore below
//               REVIEW_THRESHOLD (only when the AI assessment is available).
//
//   pending_review / pending_documents = anything else, with a stored reason an
//               admin can act on. NO path auto-rejects — writing 'rejected' is a
//               human reviewer's job (admin-secret/review-tradesperson).
//
// The per-document statuses the machine consumes are set on ingest by the OCR
// pipeline (lib/verification/document-ocr.ts); a document that fails to parse or
// has low confidence stays 'pending', so the tradesperson lands in
// pending_review — never a silent pass. Until that pipeline is wired, documents
// are still inserted as 'pending' by the register route, so this route honestly
// reports pending_review (nothing can have been machine-verified yet) rather than
// fabricating an approval.
//
// Schema note: this route writes `verification_reason`. Run the phase15 migration
// (ALTER TABLE tradespeople ADD COLUMN IF NOT EXISTS verification_reason text)
// BEFORE deploying this code, or every update will 500 on the unknown column.

interface DocumentRow {
  doc_type: string;
  status: string | null;
  expiry_date: string | null;
  doc_number: string | null;
}

type Decision = {
  status: 'approved' | 'pending_review' | 'pending_documents';
  reason: string;
};

// 'active' is the only Companies House status that clears the vetting gate
// (companies-information.service.gov.uk statuses: active, dissolved,
// liquidation, receivership, administration, ...). Anything else — including a
// dissolved company — must not pass.
function isCompaniesHouseActive(status: string | null | undefined): boolean {
  return status?.toLowerCase() === 'active';
}

// The composed verdict. Pure with respect to its inputs except for the two
// outbound lookups (Companies House + Gemini AI), each of which is optional:
//   - CH is consulted only when a company_number is present (registration column,
//     capture added in Phase 2c). No number ⇒ not required ⇒ no blocker.
//   - AI is always consulted when the row is otherwise approvable; a null result
//     (no GEMINI_API_KEY / upstream error / malformed response) must NOT pass
//     silently — an unavailable assessment keeps the profile in review rather
//     than rubber-stamping it.
async function decideVerification(input: {
  tradesperson: any;
  documents: DocumentRow[];
}): Promise<Decision> {
  const { tradesperson, documents } = input;

  // 1) Deterministic document machine — id + qualification + insurance all
  //    approved, insurance expiry_date unexpired, + trade_card for
  //    TRADE_CARD_REQUIRED trades. Never auto-rejects.
  const machine = evaluateVerificationState({
    trade: tradesperson.trade ?? '',
    documents: documents.map((d) => ({
      doc_type: d.doc_type,
      status: d.status,
      expiry_date: d.expiry_date,
      doc_number: d.doc_number,
    })),
  });

  // 2) Companies House — verdict ingredient only when a number is on the record.
  const companyNumber = tradesperson.company_number?.trim() || null;
  let companiesHouseProfile = null;
  if (companyNumber) {
    try {
      companiesHouseProfile = await getCompanyProfile(companyNumber);
      if (!companiesHouseProfile) {
        console.warn(
          '[verify][ch] No Companies House profile for:',
          companyNumber,
        );
      }
    } catch (chError) {
      console.error('[verify][ch] Companies House lookup failed:', chError);
    }
  }

  // 3) AI risk ingredient.
  const aiResult = await aiVerifyTradesperson({
    tradespersonId: tradesperson.id,
    firstName: tradesperson.first_name ?? '',
    lastName: tradesperson.last_name ?? '',
    trade: tradesperson.trade ?? '',
    city: tradesperson.city ?? '',
    postcode: tradesperson.postcode ?? '',
    yearsExperience: tradesperson.years_experience ?? null,
    companyNumber,
    documents: documents.map((d) => ({
      docType: d.doc_type,
      status: d.status,
      expiryDate: d.expiry_date ?? null,
    })),
    companiesHouseProfile,
  });

  // 4) Compose. If the machine itself is not satisfied there is nothing else to
  //    weigh — its status and reason stand (missing docs ⇒ pending_documents,
  //    uploaded-but-unapproved docs ⇒ pending_review).
  if (machine.nextStatus !== 'approved') {
    return { status: machine.nextStatus, reason: machine.reason };
  }

  const blockers: string[] = [];
  if (companyNumber && !isCompaniesHouseActive(companiesHouseProfile?.status)) {
    blockers.push(
      companiesHouseProfile
        ? 'companies_house_not_active'
        : 'companies_house_unverified',
    );
  }
  if (!aiResult) {
    blockers.push('ai_risk_assessment_unavailable');
  } else if (aiResult.riskScore >= REVIEW_THRESHOLD) {
    blockers.push('ai_risk_score_above_threshold');
  }

  if (blockers.length > 0) {
    return { status: 'pending_review', reason: blockers.join('|') };
  }

  return { status: 'approved', reason: 'all_required_documents_valid' };
}

export async function POST(request: NextRequest) {
  // Admin bearer gate (lib/auth/admin-guard): fail closed with 401 before any
  // Supabase/DB work when ADMIN_SECRET_KEY is absent or the token is wrong.
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const { tradespersonId } = await request.json();

    if (!tradespersonId) {
      return NextResponse.json(
        { error: 'Tradesperson ID is required' },
        { status: 400 },
      );
    }

    const { data: tradesperson, error: fetchError } = await supabaseAdmin
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (fetchError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 },
      );
    }

    const { data: docs } = await supabaseAdmin
      .from('documents')
      .select('doc_type, status, expiry_date, doc_number')
      .eq('trade_id', tradespersonId);

    const decision = await decideVerification({
      tradesperson,
      documents: (docs || []) as DocumentRow[],
    });

    console.log('[verify][decision]', {
      tradespersonId,
      machineStatus: decision.status,
      reason: decision.reason,
    });

    // Guard: never silently *downgrade* a currently-approved tradesperson out of
    // 'approved' from the verify button. Expiry/re-validation enforcement on live
    // profiles is a separate cadence (it needs its own notification), not a
    // side-effect of re-clicking Verify. An approved profile whose fresh verdict
    // is pending is left as-is and the reason is surfaced so the admin can act
    // via the review/suspend routes instead.
    const currentlyApproved =
      tradesperson.is_approved === true ||
      tradesperson.verification_status === 'approved';

    const applyingDowngrade =
      currentlyApproved && decision.status !== 'approved';

    let persistedStatus: string;
    let needsReview = false;

    if (applyingDowngrade) {
      persistedStatus = 'approved';
      needsReview = true;
    } else {
      // Approval is only ever granted when the machine cleared every gate; every
      // other state keeps is_approved/is_verified false. is_active is deliberately
      // NOT written here — verifying must never un-suspend a banned account (that
      // is suspend-tradesperson's domain).
      const patch =
        decision.status === 'approved'
          ? {
              is_approved: true,
              is_verified: true,
              verification_status: 'approved' as const,
              verification_reason: decision.reason,
            }
          : {
              is_approved: false,
              is_verified: false,
              verification_status: decision.status,
              verification_reason: decision.reason,
            };

      const { error: updateError } = await supabaseAdmin
        .from('tradespeople')
        .update(patch)
        .eq('id', tradespersonId);

      if (updateError) {
        console.error('Error updating tradesperson:', updateError);
        return NextResponse.json(
          { error: 'Failed to apply verification decision' },
          { status: 500 },
        );
      }
      persistedStatus = patch.verification_status;
    }

    // Single, gated notification on a genuine transition into approved only —
    // replaces the old unconditional triple email (Phase 4 #18 consolidates this
    // into one notification_logs event). Never fires on a repeat verify of an
    // already-approved profile, so it cannot spam.
    if (decision.status === 'approved' && !currentlyApproved) {
      try {
        const result = await sendProfileApprovedEmail({
          to: tradesperson.email,
          firstName: tradesperson.first_name,
          lastName: tradesperson.last_name,
          trade: tradesperson.trade,
          city: tradesperson.city,
          postcode: tradesperson.postcode,
          yearsExperience: tradesperson.years_experience,
        });
        console.log('[verify][email] approved email sent:', result.messageId);
      } catch (emailError) {
        // A delivery failure must never fail the verification decision itself —
        // the status was already persisted above.
        console.error('Failed to send approval email:', emailError);
      }
    }

    const isApproved = decision.status === 'approved';

    return NextResponse.json({
      message: needsReview
        ? `Profile is already approved but no longer passes automatic checks — ${decision.reason}. Review recommended.`
        : isApproved
          ? 'Tradesperson verified and approved'
          : `Tradesperson is not auto-approved — ${decision.reason}. Manual review required.`,
      verification_status: persistedStatus,
      autoApproved: isApproved && !currentlyApproved,
      reason: decision.reason,
      tradesperson: {
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name,
      },
    });
  } catch (error) {
    console.error('Error in verify tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
