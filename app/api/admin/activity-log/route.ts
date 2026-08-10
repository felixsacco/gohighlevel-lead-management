import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jismdkfjkngwbpddhomx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Table may not exist yet (run supabase-notifications-and-admin-log.sql)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('admin_activity_log table not found – run supabase-notifications-and-admin-log.sql');
        return NextResponse.json({ entries: [] });
      }
      console.error('admin_activity_log fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entries: data || [] });
  } catch (e) {
    console.error('activity-log API error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
