import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { authorizeTradeSession } from '@/lib/auth/trade-session';

export async function POST(request: NextRequest) {
  const auth = authorizeTradeSession(request);
  // NB: compare with `=== false`, not `!auth.ok`. This project runs tsconfig
  // strict:false, where truthiness narrowing of a boolean-typed discriminant
  // does NOT happen (neither `!auth.ok` nor an `else` on `if (auth.ok)`
  // narrows), so `auth.reason` below would not type-check. The explicit
  // comparison narrows the union to the { ok: false } member reliably.
  if (auth.ok === false) {
    if (auth.reason === "not_configured") {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message:
            "Submitting quotations is unavailable because tradesperson sessions are not configured on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "A valid tradesperson session is required to submit a quotation. Please sign in to your account and try again.",
      },
      { status: 401 },
    );
  }

  // The actor id comes exclusively from the signed session token, never from the
  // request body — an arbitrary body `tradespersonId` can no longer spoof a
  // different tradesperson.
  const tradespersonId = auth.claims.sub;

  try {
    const { jobId, quotationAmount, quotationNotes } = await request.json();

    if (!jobId || !quotationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, quotationAmount' },
        { status: 400 }
      );
    }

    // All reads and writes here run on the service-role client: RLS denies anon
    // INSERTs into job_applications, and the job lookup below joins clients (PII).
    const supabase = getSupabaseAdmin();
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

    // Fresh account gate: the signed token identifies the caller, but an account
    // disabled after login must not keep submitting quotations.
    if (!tradesperson.is_active || !tradesperson.is_approved || !tradesperson.is_verified) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Your account is not eligible to submit quotations. Please contact support if you believe this is a mistake.'
        },
        { status: 403 }
      );
    }

    // Purchase gate (P1#2): competing for a lead costs the paid unlock. Without
    // a `paid` lead_purchases row for this job owned by this tradesperson —
    // which only the mark_lead_purchase_paid RPC can create — a quotation is
    // rejected. (Unlimited-plan entitlement is not yet modelled on the account;
    // add an OR clause here the day it is.)
    const { data: paidLead } = await supabase
      .from('lead_purchases')
      .select('id')
      .eq('job_id', jobId)
      .eq('tradesperson_id', tradespersonId)
      .eq('status', 'paid')
      .maybeSingle();

    if (!paidLead) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message:
            "This lead must be unlocked before you can submit a quotation for it. Pay once to unlock the customer's contact details and apply for the work."
        },
        { status: 403 }
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

    const admin = supabase; // reuse the single service-role client
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