import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Wall A (W1): this public approved-jobs feed joins clients (first/last name,
// PII, anon-revoked) on to each approved job — the REVOKE would break the nested
// relation read. It runs on the service-role client instead. The query itself
// still filters is_approved=true and status='approved', so switching the key
// does not widen which rows are returned; only approved jobs reach the client.

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = getSupabaseAdmin();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Get only approved jobs with client information
    const { data: jobs, error } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_approved', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: jobs || []
    });

  } catch (error) {
    console.error('Error in jobs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 