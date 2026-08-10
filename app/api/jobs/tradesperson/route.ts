import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tradesMatch } from '@/lib/utils/trade-matcher';
import { isPostcodeWithinRange } from '@/lib/utils/postcode-matcher';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

// Max miles between tradesperson and job postcode before we filter the job
// out on location alone. Matches the notification system so a tradesperson
// who gets emailed about a job will also see it on their dashboard.
const LOCATION_RADIUS_MILES = 50;

function locationMatches(
  jobPostcode: string,
  tpPostcode: string,
): boolean {
  const j = String(jobPostcode || '').trim();
  const t = String(tpPostcode || '').trim();
  if (!j || !t) return false;

  // Exact match (after stripping spaces, case-insensitive)
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  if (norm(j) === norm(t)) return true;

  // Same outward code (e.g. "M1 5GD" and "M1 6AB" both start with "M1 ")
  const outward = (s: string) => s.trim().split(/\s+/)[0].toUpperCase();
  if (outward(j) && outward(j) === outward(t)) return true;

  // UK postcode radius match - falls back to false for non-UK strings
  try {
    return isPostcodeWithinRange(j, t, LOCATION_RADIUS_MILES);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const trade = searchParams.get('trade') || '';
    const location = searchParams.get('location') || '';
    const tradespersonId = searchParams.get('tradespersonId') || '';

    console.log('Tradesperson jobs API called with filters:', {
      page,
      limit,
      trade,
      location,
      tradespersonId,
    });

    // Get jobs the tradesperson has already applied to (if tradespersonId provided)
    let appliedJobIds: string[] = [];
    if (tradespersonId) {
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('tradesperson_id', tradespersonId);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      } else {
        appliedJobIds = applications?.map((app) => app.job_id) || [];
        console.log(
          `Tradesperson ${tradespersonId} has applied to ${appliedJobIds.length} jobs:`,
          appliedJobIds,
        );
      }
    }

    // Pull every open, approved, unassigned, unflagged job and filter in JS
    // using the same matchers the notification system uses. This keeps the
    // dashboard and the "new lead" alerts in sync - if a tradesperson is
    // notified about a job, they will see it on the dashboard too.
    let query = supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('is_approved', true)
      .eq('is_completed', false)
      .is('assigned_tradesperson_id', null)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false });

    if (appliedJobIds.length > 0) {
      query = query.not('id', 'in', `(${appliedJobIds.join(',')})`);
    }

    // Fetch generously; we will trim to `limit` after JS filtering.
    const { data: allJobs, error } = await query.limit(500);

    if (error) {
      console.error('Error fetching tradesperson jobs:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch jobs',
          message: 'Database error',
          details: error,
        },
        { status: 500 },
      );
    }

    const rows = allJobs || [];

    // Trade OR area UNION match - if the tradesperson's trade matches the
    // job's trade (with synonyms like painter <-> painting), OR the job is
    // within their service radius, surface it.
    const filtered = rows.filter((job: any) => {
      const tradeOk = trade
        ? tradesMatch(String(job.trade || ''), trade)
        : true;
      const areaOk = location ? locationMatches(String(job.postcode || ''), location) : true;
      // Default to inclusive when both filter inputs are empty.
      return tradeOk || areaOk;
    });

    console.log(
      `Filtered ${rows.length} candidate jobs -> ${filtered.length} matches for trade="${trade}" location="${location}"`,
    );

    if (filtered.length > 0) {
      console.log(
        'Match details:',
        filtered.slice(0, 10).map((j: any) => ({
          id: j.id,
          trade: j.trade,
          postcode: j.postcode,
          status: j.status,
        })),
      );
    } else if (rows.length > 0) {
      console.log(
        'No matches after filtering. Sample of candidates:',
        rows.slice(0, 5).map((j: any) => ({
          id: j.id,
          trade: j.trade,
          postcode: j.postcode,
        })),
      );
    }

    // Paginate the filtered set.
    const total = filtered.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const jobs = filtered.slice(from, to);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      message: 'Jobs fetched successfully',
    });
  } catch (error) {
    console.error('Tradesperson jobs fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch jobs',
      },
      { status: 500 },
    );
  }
}

