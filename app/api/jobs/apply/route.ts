import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { jobId, tradespersonId, quotationAmount, quotationNotes } = await request.json();

    if (!jobId || !tradespersonId || !quotationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, quotationAmount' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          email,
          phone,
          first_name,
          last_name
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is still open
    if (job.application_status !== 'open') {
      return NextResponse.json(
        { error: 'Job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Get tradesperson details
    const { data: tradesperson, error: tradespersonError } = await supabase
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (tradespersonError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 }
      );
    }

    // Check if tradesperson already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('tradesperson_id', tradespersonId)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        tradesperson_id: tradespersonId,
        quotation_amount: parseFloat(quotationAmount),
        quotation_notes: quotationNotes || '',
        status: 'pending'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Note: Job remains in 'open' status until admin approves the quotation
    // The application is stored in job_applications table with 'pending' status

    await sendNotification({
      type: 'tradesperson_applied_alert',
      recipientId: String(job.clients.id),
      recipientEmail: job.clients.email,
      recipientPhone: job.clients.phone,
      channels: ['email', 'sms'],
      idempotencyKey: `tradesperson_applied_alert:${application.id}`,
      data: {
        jobId: job.id,
        trade: job.trade,
        job_description: job.job_description,
        postcode: job.postcode,
        tradespersonName: `${tradesperson.first_name} ${tradesperson.last_name}`,
        quotationAmount,
        quotationNotes: quotationNotes || '',
      },
    });

    const admin = getSupabaseAdmin();
    if (!admin) {
      console.warn('Supabase admin not available, skipping scheduled notifications');
    } else {
      await admin.from('scheduled_notifications').upsert(
      {
        event_type: 'application_reminder',
        recipient_id: job.clients.id,
        recipient_email: job.clients.email,
        recipient_phone: job.clients.phone,
        payload: {
          kind: 'application_deadline',
          jobId: job.id,
          trade: job.trade,
          message: 'You have pending applications. Please review and assign a tradesperson.',
        },
        scheduled_for: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dedupe_key: `application_reminder:${job.id}`,
      },
      { onConflict: 'dedupe_key' },
    );

    await admin.from('scheduled_notifications').upsert(
      {
        event_type: 'application_under_review_tradesperson',
        recipient_id: tradespersonId,
        recipient_email: tradesperson.email,
        recipient_phone: tradesperson.phone,
        payload: { jobId: job.id, trade: job.trade },
        scheduled_for: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dedupe_key: `application_under_review:${job.id}:${tradespersonId}`,
      },
      { onConflict: 'dedupe_key' },
    );

    await admin.from('scheduled_notifications').upsert(
      {
        event_type: 'application_reminder',
        recipient_id: job.clients.id,
        recipient_email: job.clients.email,
        recipient_phone: job.clients.phone,
        payload: {
          kind: 'application_deadline',
          jobId: job.id,
          trade: job.trade,
          message:
            'Still deciding? Open your dashboard to compare quotes and assign a tradesperson.',
        },
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dedupe_key: `application_reminder_24h:${job.id}`,
      },
      { onConflict: 'dedupe_key' },
    );

    if (process.env.ENABLE_AUTO_ASSIGN_JOB === 'true') {
      await admin.from('scheduled_notifications').upsert(
        {
          event_type: 'application_auto_assign_due',
          recipient_id: job.clients.id,
          recipient_email: job.clients.email,
          recipient_phone: job.clients.phone,
          payload: { jobId: job.id, trade: job.trade },
          scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          dedupe_key: `application_auto_assign_due:${job.id}`,
        },
        { onConflict: 'dedupe_key' },
      );
    }
    } // end admin guard

    return NextResponse.json({
      message: 'Application submitted successfully! Your quotation is pending admin approval.',
      application: {
        id: application.id,
        jobId: application.job_id,
        status: application.status
      }
    });

  } catch (error) {
    console.error('Error in job application API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 