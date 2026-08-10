import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { 
  calculatePostcodeProximity, 
  isPostcodeWithinRange,
  arePostcodesInSameRegion 
} from '@/lib/utils/postcode-matcher';

export const dynamic = 'force-dynamic';

// Function to normalize trade names for better matching
function normalizeTradeName(trade: string): string {
  return trade.toLowerCase().trim();
}

// Function to check if trades match (handles variations)
function tradesMatch(trade1: string, trade2: string): boolean {
  const normalized1 = normalizeTradeName(trade1);
  const normalized2 = normalizeTradeName(trade2);
  
  // Direct match
  if (normalized1 === normalized2) return true;
  
  // Handle common variations
  const tradeVariations: { [key: string]: string[] } = {
    'plumber': ['plumbing', 'plumber'],
    'plumbing': ['plumber', 'plumbing'],
    'electrician': ['electrical', 'electrician'],
    'electrical': ['electrician', 'electrical'],
    'carpenter': ['carpentry', 'carpenter'],
    'carpentry': ['carpenter', 'carpentry'],
    'painter': ['painting', 'painter'],
    'painting': ['painter', 'painting'],
    'carpet & flooring': ['carpet', 'flooring', 'carpet & flooring'],
    'carpet': ['carpet & flooring', 'carpet'],
    'flooring': ['carpet & flooring', 'flooring']
  };
  
  const variations1 = tradeVariations[normalized1] || [normalized1];
  const variations2 = tradeVariations[normalized2] || [normalized2];
  
  return variations1.some(v1 => variations2.includes(v1));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trade = searchParams.get('trade');
    const postcode = searchParams.get('postcode');
    const tradespersonId = searchParams.get('tradespersonId');

    console.log('Job filtering request:', { trade, postcode, tradespersonId });

    if (!trade || !postcode) {
      return NextResponse.json(
        { error: 'Trade and postcode are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Get all approved jobs first - keep this loose, we filter in JS below.
    // NB: `is_active` was a legacy column we no longer maintain; rely on
    // `is_completed`, `is_flagged`, and assignment instead.
    let query = supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('is_approved', true);

    const { data: allJobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    console.log('Total approved jobs found:', allJobs?.length || 0);

    // If tradespersonId is provided, get their applications to exclude applied jobs
    let appliedJobIds: string[] = [];
    if (tradespersonId) {
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('tradesperson_id', tradespersonId);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      } else {
        appliedJobIds = applications?.map(app => app.job_id) || [];
        console.log('Applied job IDs:', appliedJobIds);
      }
    }

    // Filter jobs based on trade, postcode, exclude applied jobs, and only show open jobs
    const filteredJobs = allJobs?.filter(job => {
      // Skip if tradesperson has already applied to this job
      if (appliedJobIds.includes(job.id)) {
        console.log(`Job ${job.id}: Skipped - already applied`);
        return false;
      }

      // Skip if job is already assigned to another tradesperson (not open)
      if (job.assigned_tradesperson_id) {
        console.log(`Job ${job.id}: Skipped - already assigned to tradesperson ${job.assigned_tradesperson_id}`);
        return false;
      }

      // Skip if job is completed
      if (job.is_completed) {
        console.log(`Job ${job.id}: Skipped - job is completed`);
        return false;
      }

      // Skip flagged jobs
      if (job.is_flagged) {
        return false;
      }

      // Trade match (with painter <-> painting style synonyms)
      const tradeMatches = tradesMatch(job.trade, trade);

      // Postcode proximity (UK region match, falls back to prefix for non-UK)
      const proximityScore = calculatePostcodeProximity(job.postcode, postcode);
      const postcodeMatches = isPostcodeWithinRange(job.postcode, postcode, 50);

      console.log(
        `Job ${job.id}: trade="${job.trade}" (matches: ${tradeMatches}), postcode="${job.postcode}" (proximity: ${proximityScore}%, matches: ${postcodeMatches}), assigned=${job.assigned_tradesperson_id}, completed=${job.is_completed}`,
      );

      // UNION (not intersection): show the job if EITHER the trade matches
      // OR the area matches. A painter in Manchester should see painter jobs
      // anywhere in the UK, and any-trade jobs in Manchester. This mirrors
      // the notification system in notify-tradespeople-job-match.ts.
      return tradeMatches || postcodeMatches;
    }) || [];

    console.log('Filtered jobs count (excluding applied):', filteredJobs.length);

    return NextResponse.json({
      jobs: filteredJobs,
      totalJobs: allJobs?.length || 0,
      filteredCount: filteredJobs.length,
      appliedJobsCount: appliedJobIds.length,
      filters: { trade, postcode }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 