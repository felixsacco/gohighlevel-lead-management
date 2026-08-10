import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { getAdminEmail } from '@/lib/notifications/admin-inbox';
import { notifyMatchingTradespeopleForJob } from '@/lib/notifications/notify-tradespeople-job-match';
import { emitFleetIngest } from '@/lib/fleet/emitFleetIngest';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    // Handle FormData for file uploads
    const formData = await request.formData();
    console.log('Job posting request - FormData received');

    const trade = formData.get('trade') as string;
    const job_description = formData.get('job_description') as string;
    const postcode = formData.get('postcode') as string;
    const budget = formData.get('budget') as string;
    const budget_type = formData.get('budget_type') as string;
    const preferred_date = formData.get('preferred_date') as string;
    const client_id = formData.get('client_id') as string;

    // Get image files
    const imageFiles = formData.getAll('images') as File[];
    console.log('Image files received:', imageFiles.length);
    console.log('Image files details:', imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const imageUrls: string[] = [];

    // Upload images to Supabase Storage if any
    if (imageFiles.length > 0) {
      console.log('Starting image upload process...');
      
      for (const file of imageFiles) {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        if (file.size > 0) {
          const fileName = `job-images/${Date.now()}-${file.name}`;
          console.log('Uploading to path:', fileName);
          
          try {
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
              .from('job-images')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              console.error('Upload error details:', {
                message: uploadError.message,
                name: uploadError.name
              });
            } else {
              console.log('Upload successful:', uploadData);
              const { data: urlData } = supabaseAdmin.storage
                .from('job-images')
                .getPublicUrl(fileName);
              imageUrls.push(urlData.publicUrl);
              console.log('Public URL generated:', urlData.publicUrl);
            }
          } catch (uploadException) {
            console.error('Exception during upload:', uploadException);
          }
        } else {
          console.log('Skipping empty file:', file.name);
        }
      }
      
      console.log('Final image URLs:', imageUrls);
    } else {
      console.log('No image files to upload');
    }

    console.log('Job posting data:', {
      trade,
      job_description,
      postcode,
      budget,
      budget_type,
      preferred_date,
      client_id,
      imageUrls,
      imageCount: imageUrls.length
    });

    // Validate required fields
    if (!trade || !job_description || !postcode || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch client first (needed for emails and response)
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('first_name, last_name, email, phone')
      .eq('id', client_id)
      .single();

    // Create job record
    const { data: job, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert({
        client_id: client_id,
        trade,
        job_description,
        postcode,
        budget: budget ? parseFloat(budget) : null,
        budget_type: budget_type || 'fixed',
        images: imageUrls,
        preferred_date: preferred_date || null,
        status: 'approved',
        is_approved: true,
        application_status: 'open',
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting job:', insertError);
      return NextResponse.json(
        { error: 'Failed to create job', details: insertError.message },
        { status: 500 }
      );
    }

    void emitFleetIngest({
      event_type: 'job',
      summary: `New job posted: ${trade} in ${postcode} (${client?.email || 'client'})`,
      payload: {
        id: job.id,
        trade,
        postcode,
        client_id,
        budget,
        budget_type,
      },
    });

    if (client?.email) {
      await sendNotification({
        type: 'job_posted_confirmation',
        recipientId: String(client_id),
        recipientEmail: client.email,
        recipientPhone: client.phone,
        channels: ['email'],
        idempotencyKey: `job_posted_confirmation:${job.id}`,
        data: { trade, job_description, postcode, budget, budget_type, preferred_date, jobId: job.id },
      });
    }

    await sendNotification({
      type: 'job_posted_admin_alert',
      recipientId: 'admin',
      recipientEmail: getAdminEmail(),
      channels: ['email'],
      idempotencyKey: `job_posted_admin_alert:${job.id}`,
      data: {
        jobId: job.id,
        trade,
        job_description,
        postcode,
        budget,
        budget_type,
        preferred_date,
        clientName: [client?.first_name, client?.last_name].filter(Boolean).join(' '),
        clientEmail: client?.email,
        clientPhone: client?.phone,
      },
    });

    // Job is live immediately — notify matching tradespeople.
    try {
      await notifyMatchingTradespeopleForJob(supabaseAdmin, {
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

    return NextResponse.json({
      message: 'Job posted successfully! It is now live and visible to tradespeople.',
      job: {
        id: job.id,
        trade: job.trade,
        status: job.status
      }
    });

  } catch (error) {
    console.error('Error in job posting API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 