import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createClient();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const {
      jobId, 
      tradespersonId, 
      rating, 
      review,
      reviewerType,
      reviewerId 
    } = await request.json();

    if (!jobId || !tradespersonId || !rating || !reviewerType || !reviewerId) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, rating, reviewerType, reviewerId' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if job exists and is completed
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('is_completed', true)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or not completed' },
        { status: 404 }
      );
    }

    // Check if tradesperson exists
    const { data: tradesperson, error: tradespersonError } = await supabaseClient
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

    // Check if rating already exists for this job-tradesperson-reviewer combination
    const { data: existingRating, error: checkError } = await supabaseClient
      .from('job_reviews')
      .select('*')
      .eq('job_id', jobId)
      .eq('reviewer_id', reviewerId)
      .eq('tradesperson_id', tradespersonId)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already exists for this tradesperson' },
        { status: 400 }
      );
    }

    // Add rating to job_reviews table
    const { error: reviewError } = await supabaseClient
      .from('job_reviews')
      .insert({
        job_id: jobId,
        tradesperson_id: tradespersonId,
        reviewer_type: reviewerType,
        reviewer_id: reviewerId,
        rating: rating,
        review_text: review || '',
        reviewed_at: new Date().toISOString()
      });

    if (reviewError) {
      console.error('Error adding review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to add rating' },
        { status: 500 }
      );
    }

    // Notify tradesperson when review is received.
    if (tradesperson?.email) {
      await sendNotification({
        type: 'review_received_alert',
        recipientId: String(tradespersonId),
        recipientEmail: tradesperson.email,
        recipientPhone: tradesperson.phone,
        channels: ['email'],
        idempotencyKey: `review_received_alert:${jobId}:${tradespersonId}:${reviewerId}`,
        data: {
          jobId,
          rating,
          review: review || '',
          reviewerType,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Rating added successfully'
    });

  } catch (error) {
    console.error('Error in rate tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 