import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { assignJobFromApplication } from '@/lib/jobs/assignJobFromApplication';

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing required field: applicationId' },
        { status: 400 }
      );
    }

    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        job_id,
        tradesperson_id,
        quotation_amount,
        quotation_notes,
        applied_at,
        status,
        jobs!inner (
          id,
          client_id,
          trade,
          job_description,
          postcode,
          budget,
          budget_type,
          application_status,
          assigned_tradesperson_id,
          clients!inner (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        ),
        tradespeople!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          trade
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status === 'accepted') {
      return NextResponse.json(
        { error: 'Application is already accepted' },
        { status: 409 }
      );
    }

    const job = application.jobs as any;
    const trade = application.tradespeople as any;
    const client = job.clients as any;

    if (job.application_status === 'in_progress' && job.assigned_tradesperson_id) {
      return NextResponse.json(
        { error: 'Job is already assigned to another tradesperson' },
        { status: 409 }
      );
    }

    const assignResult = await assignJobFromApplication({
      supabaseAdmin,
      applicationId,
      application: {
        job_id: application.job_id,
        tradesperson_id: application.tradesperson_id,
        quotation_amount: application.quotation_amount,
        quotation_notes: application.quotation_notes,
        applied_at: application.applied_at,
      },
      job: {
        id: job.id,
        client_id: job.client_id,
        trade: job.trade,
        job_description: job.job_description,
        postcode: job.postcode,
        application_status: job.application_status,
        assigned_tradesperson_id: job.assigned_tradesperson_id,
      },
      clientInfo: {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
      },
      tradeInfo: {
        id: trade.id,
        first_name: trade.first_name,
        last_name: trade.last_name,
        email: trade.email,
        phone: trade.phone,
      },
      assignedBy: 'admin',
    });

    if (!assignResult.ok) {
      return NextResponse.json(
        { error: "error" in assignResult ? assignResult.error : "Unknown error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application approved and job assigned successfully',
      jobId: job.id,
    });

  } catch (error: any) {
    console.error('Error approving application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
