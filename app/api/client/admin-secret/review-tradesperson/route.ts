import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendProfileApprovedEmail } from '@/lib/notifications/approval-email';
import { verifyAdminSecret } from '@/lib/auth/admin-guard';

// Phase 2 (P1) — zero-touch vetting. This is the HUMAN review route, the only
// writer of verification_status='rejected' in the system (the GDPR Article 22
// human-review outlet described in docs/VERIFICATION.md — a machine must never
// auto-reject).
//
// It complements admin-secret/verify-tradesperson (the deterministic machine
// verdict) and is reached from the same admin surface for profiles that land in
// pending_review / pending_documents. Where verify *decides* from documents,
// this route records an admin's *explicit* decision after human inspection:
//
//   decision: 'approved' | 'rejected'
//   reason:   required (non-empty) when rejecting; stored on verification_reason.
//
// Rules:
//   - 'approved' requires at least one document row on file — a human approve
//     with nothing to inspect is the old unconditional approve-click we deleted,
//     so it is refused (409). This is not a machine re-check; the admin has
//     already eyeballed the uploaded docs and is confirming them.
//   - 'rejected' requires a reason (why the profile fails vetting).
//   - is_active is NEVER written here — review decides certification, not
//     listing. Removing a live profile from the marketplace is
//     suspend-tradesperson's job.
//   - The approval email fires only on a genuine transition into approved
//     (!currentlyApproved), so a profile approved once is emailed exactly once —
//     the same gate as the verify route, sharing lib/notifications/approval-email.
//
// Schema note: writes verification_reason (phase15 migration adds the column).

type ReviewDecision = 'approved' | 'rejected';

const VALID_DECISIONS: ReviewDecision[] = ['approved', 'rejected'];

function isReviewDecision(value: unknown): value is ReviewDecision {
  return value === 'approved' || value === 'rejected';
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
    const body = await request.json();
    const { tradespersonId, decision, reason } = body ?? {};

    if (!tradespersonId) {
      return NextResponse.json(
        { error: 'Tradesperson ID is required' },
        { status: 400 },
      );
    }

    if (!isReviewDecision(decision)) {
      return NextResponse.json(
        { error: "decision must be exactly 'approved' or 'rejected'" },
        { status: 400 },
      );
    }

    const rejectionReason =
      typeof reason === 'string' ? reason.trim() : '';

    if (decision === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'A reason is required when rejecting a tradesperson' },
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

    // A human approval needs something to have been inspected. Refuse an approve
    // on a record with no documents at all — that is the blanket approve-click
    // this phase removed, just moved behind a human. (Docs that failed OCR stay
    // 'pending'; a human may still confirm them after manual inspection — the
    // guard is on document PRESENCE, not document status.)
    if (decision === 'approved') {
      const { count, error: countError } = await supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('trade_id', tradespersonId);

      if (countError) {
        console.error('[review] document count failed:', countError);
        return NextResponse.json(
          { error: 'Failed to inspect documents on file' },
          { status: 500 },
        );
      }

      if (!count || count === 0) {
        return NextResponse.json(
          {
            error:
              'Cannot approve a profile with no documents on file. Ask the tradesperson to upload their documents first.',
          },
          { status: 409 },
        );
      }
    }

    const currentlyApproved =
      tradesperson.is_approved === true ||
      tradesperson.verification_status === 'approved';

    // Genuine transition guard: re-reviewing an already-approved profile (e.g. an
    // admin re-confirms after a flagged re-verify) must not re-send the approval
    // email — it was already sent on the first approval.
    const enteringApproved = decision === 'approved' && !currentlyApproved;

    const storedReason =
      decision === 'rejected'
        ? rejectionReason
        : (typeof reason === 'string' && reason.trim())
          ? reason.trim()
          : 'approved_by_human_review';

    const patch =
      decision === 'approved'
        ? {
            is_approved: true,
            is_verified: true,
            verification_status: 'approved' as const,
            verification_reason: storedReason,
          }
        : {
            is_approved: false,
            is_verified: false,
            verification_status: 'rejected' as const,
            verification_reason: storedReason,
          };

    const { error: updateError } = await supabaseAdmin
      .from('tradespeople')
      .update(patch)
      .eq('id', tradespersonId);

    if (updateError) {
      console.error('[review] update failed:', updateError);
      return NextResponse.json(
        { error: 'Failed to apply review decision' },
        { status: 500 },
      );
    }

    if (enteringApproved) {
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
        console.log('[review][email] approved email sent:', result.messageId);
      } catch (emailError) {
        // Delivery failure must never fail the persisted review decision.
        console.error('Failed to send approval email:', emailError);
      }
    }

    return NextResponse.json({
      message:
        decision === 'approved'
          ? 'Tradesperson approved by review'
          : 'Tradesperson rejected by review',
      verification_status: patch.verification_status,
      reason: storedReason,
      tradesperson: {
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name,
      },
    });
  } catch (error) {
    console.error('Error in review tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
