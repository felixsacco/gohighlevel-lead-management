import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from '@/lib/notifications';
import { getAdminEmail } from '@/lib/notifications/admin-inbox';
import { normalizeUkPhone } from '@/lib/utils/phone-mask';
import { geocodePostcode } from '@/lib/geo/postcodes';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phoneRaw = formData.get('phone') as string;
    const phone = normalizeUkPhone(phoneRaw) || phoneRaw;
    const trade = formData.get('trade') as string;
    const city = formData.get('city') as string;
    const postcode = formData.get('postcode') as string;
    const idDocument = formData.get('idDocument') as File | null;
    const insuranceDocument = formData.get('insuranceDocument') as File | null;
    const qualificationDocument = formData.get('qualificationDocument') as File | null;
    const tradeCardDocument = formData.get('tradeCardDocument') as File | null;
    const insuranceExpiry = formData.get('insuranceExpiry') as string;
    const qualificationNumber = formData.get('qualificationNumber') as string;
    const tradeCardNumber = formData.get('tradeCardNumber') as string;
    const yearsExperience = formData.get('yearsExperience') as string;
    const rawSubscriptionPlan = (formData.get('subscriptionPlan') as string | null)?.trim();

    // Subscription plan defaults to the free "pay_per_lead" tier if the
    // client somehow forgets to send one. Only the two values we offer at
    // signup are accepted; anything else is rejected.
    const ALLOWED_PLANS = ['pay_per_lead', 'unlimited_monthly'] as const;
    type AllowedPlan = (typeof ALLOWED_PLANS)[number];
    const subscriptionPlan: AllowedPlan =
      rawSubscriptionPlan && (ALLOWED_PLANS as readonly string[]).includes(rawSubscriptionPlan)
        ? (rawSubscriptionPlan as AllowedPlan)
        : 'pay_per_lead';

    if (rawSubscriptionPlan && !(ALLOWED_PLANS as readonly string[]).includes(rawSubscriptionPlan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan selected.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!fullName || !email || !password || !phone || !trade || !city || !postcode) {
      console.log('Missing required fields:', { fullName, email, phone, trade, city, postcode });
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate required documents for ALL tradespeople
    if (!idDocument || !insuranceDocument || !qualificationDocument) {
      return NextResponse.json(
        { error: 'ID document, insurance document, and proof of qualifications are required for all tradespeople.' },
        { status: 400 }
      );
    }

    // Check if this trade requires additional trade card
    const needsTradeCard = ['Plumber', 'Electrician', 'Aircon Engineer'].includes(trade);
    if (needsTradeCard && !tradeCardDocument) {
      return NextResponse.json(
        { error: 'Trade card is required for Plumbers, Electricians, and Aircon Engineers.' },
        { status: 400 }
      );
    }

    // Validate required additional fields
    if (!insuranceExpiry || !qualificationNumber) {
      return NextResponse.json(
        { error: 'Insurance expiry date and qualification number are required.' },
        { status: 400 }
      );
    }

    if (needsTradeCard && !tradeCardNumber) {
      return NextResponse.json(
        { error: 'Trade card number is required for this trade.' },
        { status: 400 }
      );
    }

    console.log('Form data received:', { 
      fullName, 
      email, 
      phone, 
      trade, 
      city, 
      postcode,
      yearsExperience,
      hasIdDoc: !!idDocument,
      hasInsuranceDoc: !!insuranceDocument,
      hasQualificationDoc: !!qualificationDocument,
      hasTradeCardDoc: !!tradeCardDocument,
      needsTradeCard
    });

    // Initialize Supabase client from environment
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('[trades/register] Supabase env vars missing — cannot create user');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Generate user ID
    const userId = uuidv4();

    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('tradespeople')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'A tradesperson with this email already exists' },
        { status: 400 }
      );
    }

    // 2. Insert into tradespeople table
    const baseTradespersonRow = {
      id: userId,
      email: email,
      password_hash: password,
      first_name: fullName.split(' ')[0] || fullName,
      last_name: fullName.split(' ').slice(1).join(' ') || '',
      phone: phone,
      trade: trade,
      city: city,
      postcode: postcode,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      is_verified: true,
      is_active: true,
      is_approved: true,
      verification_status: 'approved',
    } as Record<string, unknown>;

    let { error: tradespersonError } = await supabase
      .from('tradespeople')
      .insert({
        ...baseTradespersonRow,
        subscription_plan: subscriptionPlan,
        subscription_status: 'pending',
      });

    // If the subscription columns don't exist yet on this environment
    // (phase6 migration not applied), retry without them so signup still
    // works. We log the plan choice so it isn't silently lost.
    if (
      tradespersonError &&
      /subscription_plan|subscription_status/i.test(
        `${tradespersonError.message || ''} ${tradespersonError.details || ''}`
      )
    ) {
      console.warn(
        'subscription_plan / subscription_status columns missing - retrying insert without them. ' +
          'Run sql/phase6-subscription-plans.sql to enable persistence.',
        { chosenPlan: subscriptionPlan }
      );
      const retry = await supabase
        .from('tradespeople')
        .insert(baseTradespersonRow);
      tradespersonError = retry.error;
    }

    if (tradespersonError) {
      console.error('Error inserting tradesperson:', tradespersonError);
      console.error('Error details:', {
        code: tradespersonError.code,
        message: tradespersonError.message,
        details: tradespersonError.details,
        hint: tradespersonError.hint
      });
      return NextResponse.json(
        {
          error: 'Failed to create tradesperson account',
          details: tradespersonError.message,
          code: tradespersonError.code
        },
        { status: 500 }
      );
    }

    await sendNotification({
      type: 'tradesperson_signup_admin_alert',
      recipientId: 'admin',
      recipientEmail: getAdminEmail(),
      channels: ['email'],
      idempotencyKey: `tradesperson_signup_admin_alert:${userId}`,
      data: {
        fullName,
        email,
        phone,
        trade,
        yearsExperience,
        city,
        postcode,
        subscriptionPlan,
      },
    });

    // 3. Check if documents bucket exists and create if needed
    let bucketExists = false;
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      bucketExists = !!documentsBucket;

      if (!documentsBucket) {
        console.log('Documents bucket not found. Please create it manually in Supabase dashboard.');
        console.log('Bucket name: documents');
        console.log('Settings: private, 10MB limit, allowed types: PDF, JPEG, PNG, JPG, GIF');
        
        // Continue without bucket for now - user can upload documents later
        console.log('Continuing registration without document uploads...');
      } else {
        console.log('Documents bucket exists');
      }
    } catch (error) {
      console.error('Error checking bucket:', error);
      console.log('Continuing registration without document uploads...');
    }

    // Handle document uploads only if bucket exists
    const documentUploads = [];

    if (bucketExists) {
      // Upload ID Document
      if (idDocument) {
        try {
          const fileExt = idDocument.name.split('.').pop();
          const fileName = `${userId}/id-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, idDocument);

          if (uploadError) {
            console.error('ID document upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload ID document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'id',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            status: 'approved',
          });
        } catch (error: any) {
          console.error('ID document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process ID document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Insurance Document
      if (insuranceDocument) {
        try {
          const fileExt = insuranceDocument.name.split('.').pop();
          const fileName = `${userId}/insurance-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, insuranceDocument);

          if (uploadError) {
            console.error('Insurance upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload insurance document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'insurance',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            expiry_date: insuranceExpiry || null,
            status: 'approved',
          });
        } catch (error: any) {
          console.error('Insurance document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process insurance document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Qualification Document
      if (qualificationDocument) {
        try {
          const fileExt = qualificationDocument.name.split('.').pop();
          const fileName = `${userId}/qualification-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, qualificationDocument);

          if (uploadError) {
            console.error('Qualification upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload qualification document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'qualification',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: qualificationNumber || null,
            status: 'approved',
          });
        } catch (error: any) {
          console.error('Qualification document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process qualification document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Trade Card Document (for specific trades)
      if (tradeCardDocument) {
        try {
          const fileExt = tradeCardDocument.name.split('.').pop();
          const fileName = `${userId}/trade-card-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, tradeCardDocument);

          if (uploadError) {
            console.error('Trade card upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload trade card document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'trade_card',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: tradeCardNumber || null,
            status: 'approved',
          });
        } catch (error: any) {
          console.error('Trade card document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process trade card document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // 4. Insert document records if we have any uploads
      if (documentUploads.length > 0) {
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert(documentUploads);

        if (docError) {
          console.error('Document record error:', docError);
          return NextResponse.json(
            { error: 'Failed to create document records' },
            { status: 500 }
          );
        }

        // Auto-approve all registrations — no admin review step.
        const nextTradeUpdate: Record<string, unknown> = {
          verification_status: 'approved',
          is_verified: true,
          is_approved: true,
          is_active: true,
        };

        const { error: stateErr } = await supabase
          .from('tradespeople')
          .update(nextTradeUpdate)
          .eq('id', userId);
        if (stateErr) {
          console.error('Failed to update verification status:', stateErr);
        }
      }
    } else {
      console.log('Skipping document uploads - bucket not available');
    }

    // Welcome notifications for every new tradesperson (idempotent).
    try {
      await sendNotification({
        type: 'tradesperson_next_steps',
        recipientId: String(userId),
        recipientEmail: email,
        recipientPhone: phone,
        channels: ['email', 'push'],
        idempotencyKey: `tradesperson_next_steps:auto:${userId}`,
        data: { trade, city, postcode, autoApproved: true },
      });
      await sendNotification({
        type: 'profile_live_alert',
        recipientId: String(userId),
        recipientEmail: email,
        recipientPhone: phone,
        channels: ['email', 'push'],
        idempotencyKey: `tradesperson_profile_live:auto:${userId}`,
        data: { message: 'Your profile is approved and visible to customers.' },
      });
    } catch (notifyErr) {
      console.error('Welcome notifications failed (non-fatal):', notifyErr);
    }

    // Geocode postcode (awaited so it completes on Vercel serverless)
    try {
      const coords = await geocodePostcode(postcode);
      if (coords) {
        await supabase
          .from("tradespeople")
          .update({ latitude: coords.latitude, longitude: coords.longitude })
          .eq("id", userId);
      }
    } catch (e) {
      console.error(
        "[trades/register] Geocode failed:",
        e instanceof Error ? e.message : String(e),
      );
    }

    // Unlimited monthly plan: payment is handled externally via GoHighLevel.
    // The tradesperson is registered on the plan they chose; GHL manages invoicing.

    return NextResponse.json({
      success: true,
      message:
        'Trade registration successful! Your account is approved — you can log in and start receiving jobs.',
      subscriptionPlan,
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error?.message || String(error),
        stack: error?.stack || 'No stack trace available',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...',
        supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      { status: 500 }
    );
  }
}