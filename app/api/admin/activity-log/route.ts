import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Fail closed: refuse to serve the activity log rather than silently connect
  // to a fallback project (or throw at module load with an unclear error).
  console.error('activity-log: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
}

function getClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase environment not configured' },
      { status: 500 }
    );
  }

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
