import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';

// Wall A (W1): the internal moderation log is read by the admin dashboard, which
// carries the HttpOnly admin_session cookie. It previously rode the anon key over a
// no-RLS table, leaving the log readable by anyone. It is now served from the
// service-role client and gated on the same admin_session cookie that
// /api/admin/proxy/* verifies — anonymous callers get 401 before any DB work.

export async function GET(request: NextRequest) {
  // Admin-only read of the moderation log.
  const session = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
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
