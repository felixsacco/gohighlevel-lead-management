import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';

export const dynamic = 'force-dynamic';

// Wall A (W1): admin moderation feed over jobs joined with client PII (email/phone).
// jobs is anon-revoked, and jobs that are not approved (including the flagged ones
// under moderation) are not visible to the anon role — so swapping this onto the
// service-role client alone would WIDEN it from "no anon access" to a full PII read.
// It is therefore gated on the same HttpOnly admin_session cookie that
// /api/admin/proxy/* verifies; anonymous callers get 401 before any DB work.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Admin-only feed: require the HttpOnly admin_session cookie before any DB work.
    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query with client information
    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`trade.ilike.%${search}%,job_description.ilike.%${search}%,postcode.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: jobs, error } = await query
      .range(from, to);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch jobs',
        message: 'Database error'
      }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages
        }
      },
      message: 'Jobs fetched successfully'
    });

  } catch (error) {
    console.error('Admin jobs fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch jobs'
    }, { status: 500 });
  }
}
