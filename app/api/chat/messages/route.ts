import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/notifications/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET messages for a chat room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get('chatRoomId');

    if (!chatRoomId) {
      return NextResponse.json({ error: 'Missing chatRoomId' }, { status: 400 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });

  } catch (error) {
    console.error('Error in chat messages GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new message
export async function POST(request: NextRequest) {
  try {
    const { chatRoomId, senderId, senderType, messageText } = await request.json();

    if (!chatRoomId || !senderId || !senderType || !messageText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the message
    const { data: message, error: insertError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: senderId,
        sender_type: senderType,
        message_text: messageText
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update chat room's updated_at timestamp
    await supabaseAdmin
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatRoomId);

    // Auto-trigger AI assistant for support queries
    if (chatRoomId === '00000000-0000-0000-0000-000000000001' || senderType === 'client' || senderType === 'tradesperson') {
      try {
        // Call AI assistant to generate response
        const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '/');
        const aiResponse = await fetch(`${baseUrl}/api/chat/ai-assistant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            chatRoomId,
            userId: senderId,
            userType: senderType
          })
        });
        
        if (aiResponse.ok) {
          console.log('AI assistant response triggered successfully');
        }
      } catch (error) {
        console.error('Error triggering AI assistant:', error);
      }
    }

    // Get chat room details and recipient information
    const { data: chatRoom } = await supabaseAdmin
      .from('chat_rooms')
      .select(`
        *,
        jobs (
          trade,
          job_description,
          postcode
        ),
        clients (
          first_name,
          last_name,
          email
        ),
        tradespeople (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', chatRoomId)
      .single();

    if (chatRoom) {
      // Determine recipient information
      const recipientEmail = senderType === 'client' 
        ? chatRoom.tradespeople?.email 
        : chatRoom.clients?.email;
      
      const recipientName = senderType === 'client'
        ? `${chatRoom.tradespeople?.first_name} ${chatRoom.tradespeople?.last_name}`
        : `${chatRoom.clients?.first_name} ${chatRoom.clients?.last_name}`;
      
      const senderName = senderType === 'client'
        ? `${chatRoom.clients?.first_name} ${chatRoom.clients?.last_name}`
        : `${chatRoom.tradespeople?.first_name} ${chatRoom.tradespeople?.last_name}`;

      if (recipientEmail) {
        void sendTransactionalEmail({
          to: recipientEmail,
          subject: `New Message from ${senderName} - My Approved`,
          html: `<div style="font-family: sans-serif; padding: 1rem;">New message from ${senderName}: ${messageText}</div>`,
        }).catch((err) => console.error('Email send failed:', err));
      }
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in chat messages POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}