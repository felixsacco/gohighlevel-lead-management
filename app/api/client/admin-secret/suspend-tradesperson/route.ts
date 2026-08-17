import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { tradespersonId, reason } = await request.json();
    if (!tradespersonId) {
      return NextResponse.json({ error: 'Missing tradespersonId' }, { status: 400 });
    }

    const { data: tradesperson, error: fetchError } = await supabaseAdmin
      .from('tradespeople')
      .select('id, email, phone, first_name, last_name')
      .eq('id', tradespersonId)
      .single();

    if (fetchError || !tradesperson) {
      return NextResponse.json({ error: 'Tradesperson not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('tradespeople')
      .update({ is_active: false })
      .eq('id', tradespersonId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to suspend account' }, { status: 500 });
    }

    await sendNotification({
      type: 'account_suspended_notice',
      recipientId: String(tradespersonId),
      recipientEmail: tradesperson.email,
      recipientPhone: tradesperson.phone,
      channels: ['email'],
      idempotencyKey: `account_suspended_notice:${tradespersonId}`,
      data: {
        reason: reason || 'Policy review required',
        name: `${tradesperson.first_name || ''} ${tradesperson.last_name || ''}`.trim(),
      },
    });

    await sendNotification({
      type: 'reactivation_guide',
      recipientId: String(tradespersonId),
      recipientEmail: tradesperson.email,
      recipientPhone: tradesperson.phone,
      channels: ['email'],
      idempotencyKey: `reactivation_guide:${tradespersonId}`,
      data: {
        supportEmail: process.env.SUPPORT_EMAIL || 'support@myapproved.com',
      },
    });

    return NextResponse.json({ success: true, message: 'Tradesperson suspended and notified' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
