import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType'); // 'client' or 'tradesperson'

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    const supabaseClient = createClient();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    let query;
    if (userType === 'client') {
      query = supabaseClient
        .from('chat_rooms')
        .select(`
          *,
          jobs (
            id,
            trade,
            job_description,
            postcode,
            budget,
            budget_type
          ),
          tradespeople (
            id,
            first_name,
            last_name,
            trade,
            phone,
            email
          )
        `)
        .eq('client_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    } else {
      query = supabaseClient
        .from('chat_rooms')
        .select(`
          *,
          jobs (
            id,
            trade,
            job_description,
            postcode,
            budget,
            budget_type
          ),
          clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('tradesperson_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    }

    let { data: chatRooms, error } = await query;

    if (error) {
      // Fallback: return bare chat_rooms without joins
      const fallback = await supabaseClient
        .from('chat_rooms')
        .select('*')
        .eq(userType === 'client' ? 'client_id' : 'tradesperson_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
      chatRooms = fallback.data || [];
    }

    return NextResponse.json({ chatRooms: chatRooms || [] }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Error in chat rooms API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 