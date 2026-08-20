import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

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
