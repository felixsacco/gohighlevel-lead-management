import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { notifyMatchingTradespeopleForJob } from '@/lib/notifications/notify-tradespeople-job-match';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    console.log('Job approval API called');
    const { jobId, action, adminNotes } = await request.json();
    console.log('Request data:', { jobId, action, adminNotes });
    
    if (!jobId || !action) {
      console.log('Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: jobId and action',
        message: 'Invalid request'
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"',
        message: 'Invalid action'
      }, { status: 400 });
    }

    // Update job status
    const updateData = {
      is_approved: action === 'approve',
      status: action === 'approve' ? 'approved' : 'rejected',
      application_status: action === 'approve' ? 'open' : null, // Make job available for applications when approved
      admin_notes: adminNotes || null,
      approved_at: action === 'approve' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    console.log('Updating job with data:', updateData);
    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    console.log('Update result:', { job, updateError });

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update job status',
        message: 'Database error'
      }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found',
        message: 'Job not found'
      }, { status: 404 });
    }

    // Get client for emails
    const { data: client } = await supabase
      .from('clients')
      .select('first_name, last_name, email, phone')
      .eq('id', job.client_id)
      .single();

    if (action === 'approve' && client?.email) {
      try {
        await sendNotification({
          type: 'job_live_status',
          recipientId: job.client_id,
          recipientEmail: client.email,
          recipientPhone: client.phone,
          channels: ['email'],
          idempotencyKey: `job_live_status:${job.id}`,
          data: {
            jobId: job.id,
            trade: job.trade,
            postcode: job.postcode,
            job_description: job.job_description,
          },
        });
      } catch (e) {
        console.error('Client approval email failed', e);
      }
    }

    if (action === 'approve') {
      try {
        await notifyMatchingTradespeopleForJob(supabase, {
          id: job.id,
          trade: job.trade,
          postcode: job.postcode,
          job_description: job.job_description,
          budget: job.budget,
          budget_type: job.budget_type,
          client_id: job.client_id,
        });
      } catch (e) {
        console.error('Tradespeople job-match notifications failed', e);
      }
    }

    return NextResponse.json({ success: true, job });
  } catch (e) {
    console.error("Job approve API error", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}