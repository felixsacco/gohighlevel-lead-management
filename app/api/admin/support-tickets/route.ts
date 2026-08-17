import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

// GET support tickets for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        chat_rooms (
          id,
          job_id,
          created_at,
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
            email,
            trade
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (priority !== 'all') {
      countQuery = countQuery.eq('priority', priority);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in support tickets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST update support ticket
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { ticketId, status, assignedTo, adminNotes, resolutionNotes } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (status) updateData.status = status;
    if (assignedTo) updateData.assigned_to = assignedTo;
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (resolutionNotes) updateData.resolution_notes = resolutionNotes;

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error updating support ticket:', error);
      return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
    }

    // Notify user for dispute-ticket updates.
    if ((ticket as any)?.category === 'dispute') {
      try {
        const { data: ticketDetails } = await supabaseAdmin
          .from('support_tickets')
          .select(`
            id,
            user_type,
            chat_rooms (
              clients ( email, phone ),
              tradespeople ( email, phone )
            )
          `)
          .eq('id', ticketId)
          .single();

        const recipientEmail =
          ticketDetails?.user_type === 'client'
            ? (ticketDetails as any)?.chat_rooms?.clients?.email
            : (ticketDetails as any)?.chat_rooms?.tradespeople?.email;
        const recipientPhone =
          ticketDetails?.user_type === 'client'
            ? (ticketDetails as any)?.chat_rooms?.clients?.phone
            : (ticketDetails as any)?.chat_rooms?.tradespeople?.phone;

        if (recipientEmail) {
          await sendNotification({
            type: status === 'resolved' ? 'dispute_resolved' : 'dispute_update',
            recipientId: String(ticketId),
            recipientEmail,
            recipientPhone,
            channels: ['email'],
            idempotencyKey: `support_dispute_status:${ticketId}:${status || 'updated'}`,
            data: { ticketId, status: status || 'updated' },
          });
        }
      } catch (notifyError) {
        console.error('Failed to send support dispute notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error in support ticket update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

