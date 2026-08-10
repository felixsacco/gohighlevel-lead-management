import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { getAdminEmail } from '@/lib/notifications/admin-inbox';
import { notifyMatchingTradespeopleForJob } from '@/lib/notifications/notify-tradespeople-job-match';
import { enqueueCrmSync, enqueueNotification, isQStashConfigured } from '@/lib/qstash';
import { geocodePostcode } from '@/lib/geo/postcodes';

export async function POST(request: NextRequest) {
  console.log('=== JOB SUBMISSION API CALLED ===');

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const jobData = await request.json();
    console.log('Job submission data received:', jobData);
    
    // Authenticate if Bearer token is present, otherwise allow anonymous submission
    const authHeader = request.headers.get('authorization');
    let clientId = jobData.clientId;
    let client = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Authenticated path — verify client
      if (!clientId) {
        return NextResponse.json({
          success: false,
          error: 'Client ID required',
          message: 'Please log in to submit a job'
        }, { status: 401 });
      }

      const { data: authClient, error: clientError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .eq('id', clientId)
        .single();

      if (clientError || !authClient) {
        return NextResponse.json({
          success: false,
          error: 'Invalid client',
          message: 'Please log in to submit a job'
        }, { status: 401 });
      }

      client = authClient;
    } else {
      // Anonymous submission from public AIQuoteForm — requires firstName, lastName, clientEmail, clientPhone
      if (!jobData.firstName || !jobData.lastName || !jobData.clientEmail || !jobData.clientPhone) {
        return NextResponse.json({
          success: false,
          error: 'Contact information required',
          message: 'Please provide your name, email, and phone number'
        }, { status: 400 });
      }

      // Create a client record for anonymous submissions so phone/name are persisted
      const firstName = String(jobData.firstName || '').trim();
      const lastName = String(jobData.lastName || '').trim();

      const { data: newClient, error: clientCreateError } = await supabase
        .from('clients')
        .upsert({
          email: String(jobData.clientEmail).toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          phone: String(jobData.clientPhone).trim(),
          password_hash: 'ANONYMOUS_NOT_SET',
        }, { onConflict: 'email' })
        .select('id')
        .single();

      if (clientCreateError) {
        console.error('Failed to create client record for anonymous submission:', clientCreateError);
      } else if (newClient) {
        clientId = newClient.id;
        client = { id: newClient.id, first_name: firstName, last_name: lastName, email: jobData.clientEmail };
      }
    }

    // Validate required fields
    const requiredFields = ['trade', 'description', 'postcode', 'urgency'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        message: 'Invalid job data'
      }, { status: 400 });
    }

    // Create job submission with existing table structure
    // Use clientId if authenticated; null for anonymous submissions
    const budgetRaw = typeof jobData.budget === "string"
      ? parseFloat(jobData.budget.replace(/[£,]/g, ""))
      : jobData.budget;
    const jobInsertData: Record<string, any> = {
      client_id: clientId || null,
      trade: jobData.trade,
      job_description: jobData.description,
      postcode: jobData.postcode,
      budget: Number.isFinite(budgetRaw) ? budgetRaw : null,
      budget_type: jobData.budgetType || 'fixed',
      preferred_date: jobData.preferredDate && jobData.preferredDate !== 'Flexible' && !['Morning', 'Afternoon', 'Evening'].includes(jobData.preferredDate)
        ? jobData.preferredDate
        : null,
      preferred_time: 'any', // Default to 'any' since we don't have this field in form
      status: 'approved',
      is_approved: true,
      application_status: 'open',
      approved_at: new Date().toISOString(),
      images: jobData.images || []
    };
    
    console.log('Inserting job data:', jobInsertData);
    
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert(jobInsertData)
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create job submission',
        message: `Database error: ${jobError.message}`,
        details: jobError
      }, { status: 500 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const jobRef = job.reference_code || job.id;

    // Geocode postcode (awaited so it completes on Vercel serverless)
    try {
      const coords = await geocodePostcode(jobData.postcode);
      if (coords && supabaseAdmin) {
        await supabaseAdmin
          .from("jobs")
          .update({ latitude: coords.latitude, longitude: coords.longitude })
          .eq("id", job.id);
      }
    } catch (e) {
      console.error(
        "[jobs/submit] Geocode failed:",
        e instanceof Error ? e.message : String(e),
      );
    }

    // Create lead row for this job (one lead per job)
    if (supabaseAdmin) {
      try {
        const { data: lead } = await supabaseAdmin
          .from("leads")
          .insert({ job_id: job.id, price_pence: 499 })
          .select()
          .single();
        if (lead) console.log("[jobs/submit] Lead created:", lead.id);
      } catch (e: unknown) {
        console.error(
          "[jobs/submit] Lead creation failed:",
          e instanceof Error ? e.message : String(e),
        );
      }
    }

    // CRM sync — enqueue via QStash for reliable delivery
    if (isQStashConfigured()) {
      enqueueCrmSync({
        id: job.id,
        clientName: `${jobData.firstName || ''} ${jobData.lastName || ''}`.trim(),
        clientEmail: jobData.clientEmail,
        clientPhone: jobData.clientPhone,
        trade: jobData.trade,
        jobDescription: jobData.description,
        location: jobData.postcode,
        budget: jobData.budget,
        budgetType: jobData.budgetType,
        preferredDate: jobData.preferredDate,
        status: 'pending_approval',
        createdAt: job.created_at
      }).catch(e => console.error('CRM sync enqueue failed:', e));
    } else {
      // Fallback to direct call when QStash is not configured
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || '/'}/api/crm/sync-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          clientName: `${jobData.firstName || ''} ${jobData.lastName || ''}`.trim(),
          clientEmail: jobData.clientEmail,
          clientPhone: jobData.clientPhone,
          trade: jobData.trade,
          jobDescription: jobData.description,
          location: jobData.postcode,
          budget: jobData.budget,
          budgetType: jobData.budgetType,
          preferredDate: jobData.preferredDate,
          status: 'pending_approval',
          createdAt: job.created_at
        }),
      }).then(r => r.ok ? console.log('CRM synced') : console.log('CRM sync skipped'))
        .catch(e => console.log('CRM sync error (non-critical):', e));
    }

    // Notify matching tradespeople — await so it completes before the
    // serverless function exits (Vercel may freeze after response).
    const tradespersonNotifyPromise = supabaseAdmin
      ? notifyMatchingTradespeopleForJob(supabaseAdmin, {
          id: job.id,
          trade: job.trade,
          postcode: job.postcode,
          job_description: job.job_description,
          budget: job.budget,
          budget_type: job.budget_type,
          budget_min: jobData.budgetMin ?? null,
          budget_max: jobData.budgetMax ?? null,
          client_id: job.client_id,
          urgency: jobData.urgency,
        }).catch(e => console.error('Tradespeople job-match notifications failed', e))
      : Promise.resolve();

    const clientPhone = jobData.clientPhone || client?.phone;
    const clientEmail = jobData.clientEmail || client?.email;

    await Promise.allSettled([
      // Tradesperson matching — must complete before response to avoid
      // Vercel serverless freeze killing it mid-flight.
      tradespersonNotifyPromise,

      // Client confirmation — enqueue via QStash for reliable delivery
      (clientPhone || clientEmail)
        ? (isQStashConfigured()
            ? enqueueNotification({
                type: 'job_posted_confirmation',
                recipientEmail: clientEmail,
                recipientPhone: clientPhone,
                channels: ['email', 'sms'],
                idempotencyKey: `job_posted_confirmation:${job.id}`,
                data: {
                  jobId: job.id,
                  jobRef,
                  trade: job.trade,
                  job_description: job.job_description,
                  postcode: job.postcode,
                  urgency: jobData.urgency || 'flexible',
                  estimateLabel: jobData.estimateLabel || '',
                  timeEstimate: jobData.breakdownTime || '',
                },
              }).then(r => r.error
                ? console.error('[submit] Client confirmation enqueue failed:', r.error)
                : console.log('[submit] Client confirmation enqueued:', r.messageId))
                .catch(e => console.error('[submit] Client confirmation enqueue failed:', e))
            : sendNotification({
                type: 'job_posted_confirmation',
                recipientEmail: clientEmail,
                recipientPhone: clientPhone,
                channels: ['email', 'sms'],
                idempotencyKey: `job_posted_confirmation:${job.id}`,
                data: {
                  jobId: job.id,
                  jobRef,
                  trade: job.trade,
                  job_description: job.job_description,
                  postcode: job.postcode,
                  urgency: jobData.urgency || 'flexible',
                  estimateLabel: jobData.estimateLabel || '',
                  timeEstimate: jobData.breakdownTime || '',
                },
              }).then(() => console.log('[submit] Client confirmation sent to', clientEmail, clientPhone))
                .catch(e => console.error('[submit] Client confirmation failed', e)))
        : Promise.resolve(),

      // Admin notification — enqueue via QStash for reliable delivery
      supabaseAdmin
        ? (isQStashConfigured()
            ? enqueueNotification({
                type: 'job_posted_admin_alert',
                recipientId: 'admin',
                recipientEmail: getAdminEmail(),
                channels: ['email'],
                idempotencyKey: `job_posted_admin_alert:${job.id}`,
                data: {
                  jobId: job.id,
                  jobRef,
                  trade: job.trade,
                  job_description: job.job_description,
                  postcode: job.postcode,
                  budget: job.budget,
                  budget_type: job.budget_type,
                  clientName:
                    [jobData.firstName, jobData.lastName].filter(Boolean).join(' ') ||
                    [client?.first_name, client?.last_name].filter(Boolean).join(' ') ||
                    'Anonymous',
                  clientEmail: jobData.clientEmail || client?.email || 'No email provided',
                  clientPhone: jobData.clientPhone || null,
                },
              }).then(r => r.error
                ? console.error('[submit] Admin notification enqueue failed:', r.error)
                : console.log('[submit] Admin notification enqueued:', r.messageId))
                .catch(e => console.error('[submit] Admin notification enqueue failed:', e))
            : sendNotification({
                type: 'job_posted_admin_alert',
                recipientId: 'admin',
                recipientEmail: getAdminEmail(),
                channels: ['email'],
                idempotencyKey: `job_posted_admin_alert:${job.id}`,
                data: {
                  jobId: job.id,
                  jobRef,
                  trade: job.trade,
                  job_description: job.job_description,
                  postcode: job.postcode,
                  budget: job.budget,
                  budget_type: job.budget_type,
                  clientName:
                    [jobData.firstName, jobData.lastName].filter(Boolean).join(' ') ||
                    [client?.first_name, client?.last_name].filter(Boolean).join(' ') ||
                    'Anonymous',
                  clientEmail: jobData.clientEmail || client?.email || 'No email provided',
                  clientPhone: jobData.clientPhone || null,
                },
              }).catch(e => console.error('Admin notification failed', e)))
        : Promise.resolve(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        jobRef,
        status: job.status,
        message: 'Job submitted successfully and is now live for tradespeople'
      },
      message: 'Job submitted successfully'
    });

  } catch (error) {
    console.error('=== JOB SUBMISSION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to submit job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}