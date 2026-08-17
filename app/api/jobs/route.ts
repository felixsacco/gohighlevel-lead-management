import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = createClient();
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