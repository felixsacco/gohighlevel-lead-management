import { NextResponse } from 'next/server';

/**
 * POST /api/leads — legacy lead-capture endpoint (schema migration notice).
 *
 * This route was written against a pre-consolidation `leads` table shape —
 * name/email/phone/trade/postcode/description/estimate columns and a `status`
 * of 'new'. That shape no longer exists. Under `sql/master-consolidated.sql`:
 *   - `leads` is job-derived: job_id UNIQUE NOT NULL (FK → jobs), a status enum
 *     of open/claimed/paid/expired/cancelled, and price_pence. There are no
 *     name/email/phone/trade columns and 'new' is not a legal status.
 *   - A lead row is created only by the canonical homeowner submission flow,
 *     `POST /api/jobs/submit` (client upsert → job → lead → matching → CRM).
 *
 * Nothing in the app posts to this route (its only in-app reference,
 * `lib/api.ts#submitLead`, is itself uncalled), so rather than silently rewrite
 * its semantics — e.g. auto-publishing + auto-matching a job for a caller that
 * may have intended "capture for later review" — the handler now returns 410
 * Gone instead of writing to phantom columns. If this endpoint still needs to
 * exist for an external integrator, it should be re-pointed at the canonical
 * job-submission pipeline deliberately, not guessed at.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Endpoint superseded by consolidated schema",
      message:
        "Homeowner job requests must now go to POST /api/jobs/submit (fields: firstName, lastName, clientEmail, clientPhone, trade, description, postcode, urgency, ...).",
      detail:
        "leads is job-derived (one lead per job, FK job_id) and cannot be inserted directly with name/email/phone/trade/status='new'.",
    },
    { status: 410 }
  );
}
