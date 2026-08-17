import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { tradespersonId } = await request.json();
    if (!tradespersonId) {
      return NextResponse.json({ error: 'Missing tradespersonId' }, { status: 400 });
    }

    const { data: tradesperson, error: fetchError } = await supabaseAdmin
      .from('tradespeople')
      .select('id, email, phone')
      .eq('id', tradespersonId)
      .single();

    if (fetchError || !tradesperson) {
      return NextResponse.json({ error: 'Tradesperson not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('tradespeople')
      .update({ is_active: true })
      .eq('id', tradespersonId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reactivate account' }, { status: 500 });
    }

    await sendNotification({
      type: 'reactivation_guide',
      recipientId: String(tradespersonId),
      recipientEmail: tradesperson.email,
      recipientPhone: tradesperson.phone,
      channels: ['email'],
      idempotencyKey: `reactivated_notice:${tradespersonId}`,
      data: {
        message: 'Your account is active again. You can now receive job opportunities.',
      },
    });

    return NextResponse.json({ success: true, message: 'Tradesperson reactivated and notified' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
