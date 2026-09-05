import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { chatRoomId, userId, userType } = await request.json();

    if (!chatRoomId || !userId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseClient = createClient();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Mark all unread messages in this chat room as read (except those sent by
    // the current user). chat_messages uses `read_at` (timestamptz, NULL until
    // read) — there is no `is_read` boolean column.
    const { error } = await supabaseClient
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('chat_room_id', chatRoomId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking messages as read:', error);
      return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 