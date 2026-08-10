import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
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
