import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from '@/lib/notifications';
import { getAdminEmail } from '@/lib/notifications/admin-inbox';
import { normalizeUkPhone } from '@/lib/utils/phone-mask';
import { geocodePostcode } from '@/lib/geo/postcodes';
import { hashPassword } from '@/lib/auth/password';
import { parseDocumentImage } from '@/lib/verification/document-ocr';
import type { OcrDocTypeSlot } from '@/lib/verification/document-ocr';

// UK Companies House numbers are 8 alphanumeric characters: eight digits
// (01234567), or a two-letter prefix + six digits for non-England registrations
// and certain structures (SC, NI, OC, LP, FC, ...). Deliberately lenient — the
// field is optional and a number that fails to resolve at verify time becomes a
// human-reviewable blocker, never a signup failure — so rejecting a real but
// unusual number is the worse error. Mirrored on the register form.
const UK_COMPANY_NUMBER_REGEX = /^[A-Z]{0,2}\d{1,8}$/;

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

    // Companies House number is OPTIONAL (sole traders / partnerships leave it
    // blank). When supplied it is normalised to a clean uppercase alphanumeric
    // value — the Companies House API is case-insensitive and
    // lib/companies-house.ts strips non-alphanumerics anyway, so stripping
    // spaces and uppercasing here keeps stored values consistent. A malformed
    // non-empty value is rejected outright (400); a well-formed one that later
    // fails to resolve is a review-able blocker, not a registration error.
    const rawCompanyNumber = (formData.get('companyNumber') as string | null)?.trim() || null;
    const companyNumber = rawCompanyNumber
      ? rawCompanyNumber.replace(/\s+/g, '').toUpperCase()
      : null;
    if (companyNumber && !UK_COMPANY_NUMBER_REGEX.test(companyNumber)) {
      return NextResponse.json(
        { error: 'Invalid Companies House number. Expected e.g. 01234567 or SC123456.' },
        { status: 400 }
      );
    }

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

    // Mirror the client's minimum length. Short passwords that clear a plaintext
    // gate cost nothing to store today but are cheap for an attacker to brute
    // force against a stolen hash, so refuse them server-side too.
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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
      companyNumber,
      yearsExperience,
      hasIdDoc: !!idDocument,
      hasInsuranceDoc: !!insuranceDocument,
      hasQualificationDoc: !!qualificationDocument,
      hasTradeCardDoc: !!tradeCardDocument,
      needsTradeCard
    });

    // Wall A (W1): tradespeople and documents are anon-revoked, and this is a
    // WRITER on both, so the REVOKE breaks registration outright if it stays on
    // the anon key. Registration is inherently pre-auth — the account is being
    // created, there is no session to scope to — so this runs on the service-role
    // client via getSupabaseAdmin(). The document uploads target the private
    // 'documents' bucket, which requires the service role anyway.
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('[trades/register] Service-role env vars missing — cannot create user');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

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

    // Hash the password before it ever reaches the database. The schema column
    // is named password_hash — it must not hold a recoverable value. This route
    // runs on the default Node runtime (no edge export), so node:crypto's scrypt
    // is available here.
    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch (hashError) {
      console.error('[trades/register] Password hashing failed:', hashError);
      return NextResponse.json(
        { error: 'Failed to secure account credentials' },
        { status: 500 }
      );
    }

    // 2. Insert into tradespeople table
    //
    // Verification is NOT self-granted here. New accounts start unverified and
    // in pending admin review; the real gate is the admin verification flow
    // (app/api/client/admin-secret/verify-tradesperson/route.ts), which flips
    // is_verified/is_approved to true and verification_status to 'approved'
    // only after documents have been checked. is_active merely means "not
    // banned/suspended" and is true from signup.
    const baseTradespersonRow = {
      id: userId,
      email: email,
      password_hash: passwordHash,
      first_name: fullName.split(' ')[0] || fullName,
      last_name: fullName.split(' ').slice(1).join(' ') || '',
      phone: phone,
      trade: trade,
      city: city,
      postcode: postcode,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      is_verified: false,
      is_active: true,
      is_approved: false,
      verification_status: 'pending_documents',
    } as Record<string, unknown>;

    // Primary insert carries every optional column group that exists in the
    // target schema. company_number is spread conditionally (only when the
    // tradesperson supplied one) and is deliberately NOT folded into
    // baseTradespersonRow: the base row is what the phase6 fallback re-inserts,
    // and on an environment that has phase15 but not phase6 it would otherwise
    // silently drop the Companies House number the tradesperson just gave us.
    let tradespersonError: { message?: string; details?: string; hint?: string; code?: string } | null = null;
    {
      const { error } = await supabase
        .from('tradespeople')
        .insert({
          ...baseTradespersonRow,
          subscription_plan: subscriptionPlan,
          subscription_status: 'pending',
          ...(companyNumber ? { company_number: companyNumber } : {}),
        });
      tradespersonError = error;
    }

    // Two optional column groups (phase6 subscriptions, phase15 company_number)
    // may lag on an environment whose migration has not run yet. PostgREST
    // names the first missing column it hits, which we cannot predict, so loop:
    // each pass drops whichever group the error actually names and re-attempts,
    // until the insert fits the live schema or no optional group is left to
    // drop. company_number only ever needs a retry when a value was supplied.
    const schemaRetrySteps: Array<{
      key: string;
      match: RegExp;
      columnsMissing: string;
      sqlFile: string;
      log: Record<string, unknown>;
      build: () => Record<string, unknown>;
    }> = [
      {
        key: 'subscription',
        match: /subscription_plan|subscription_status/i,
        columnsMissing: 'subscription_plan / subscription_status',
        sqlFile: 'sql/phase6-subscription-plans.sql',
        log: { chosenPlan: subscriptionPlan },
        build: () => ({
          ...baseTradespersonRow,
          ...(companyNumber ? { company_number: companyNumber } : {}),
        }),
      },
      {
        key: 'company_number',
        match: /company_number/i,
        columnsMissing: 'company_number',
        sqlFile: 'sql/phase15-vetting.sql',
        log: { companyNumber },
        build: () => ({
          ...baseTradespersonRow,
          subscription_plan: subscriptionPlan,
          subscription_status: 'pending',
        }),
      },
    ];

    const droppedKeys = new Set<string>();
    while (tradespersonError) {
      const message =
        `${tradespersonError.message || ''} ${tradespersonError.details || ''}`;
      const step = schemaRetrySteps.find(
        (s) => !droppedKeys.has(s.key) && s.match.test(message)
      );
      if (!step) break;
      droppedKeys.add(step.key);
      console.warn(
        `${step.columnsMissing} column(s) missing - retrying insert without them. ` +
          `Run ${step.sqlFile} to enable persistence.`,
        step.log
      );
      const retry = await supabase
        .from('tradespeople')
        .insert(step.build());
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
        companyNumber,
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

    // Handle document uploads only if bucket exists. Each uploaded file also
    // becomes an OCR candidate (Phase 2b): once the documents rows are written,
    // its bytes are sent to Gemini for an independent machine read which may
    // promote a high-confidence parse to 'approved'. Candidates are keyed by an
    // explicit row id so the post-insert per-row update is addressable.
    const documentUploads = [];
    const ocrCandidates: Array<{
      rowId: string;
      docType: OcrDocTypeSlot;
      file: File;
    }> = [];

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

          const docRowId = uuidv4();
          documentUploads.push({
            id: docRowId,
            trade_id: userId,
            doc_type: 'id',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            status: 'pending',
          });
          ocrCandidates.push({ rowId: docRowId, docType: 'id', file: idDocument });
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

          const docRowId = uuidv4();
          documentUploads.push({
            id: docRowId,
            trade_id: userId,
            doc_type: 'insurance',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            expiry_date: insuranceExpiry || null,
            status: 'pending',
          });
          ocrCandidates.push({ rowId: docRowId, docType: 'insurance', file: insuranceDocument });
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

          const docRowId = uuidv4();
          documentUploads.push({
            id: docRowId,
            trade_id: userId,
            doc_type: 'qualification',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: qualificationNumber || null,
            status: 'pending',
          });
          ocrCandidates.push({ rowId: docRowId, docType: 'qualification', file: qualificationDocument });
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

          const docRowId = uuidv4();
          documentUploads.push({
            id: docRowId,
            trade_id: userId,
            doc_type: 'trade_card',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: tradeCardNumber || null,
            status: 'pending',
          });
          ocrCandidates.push({ rowId: docRowId, docType: 'trade_card', file: tradeCardDocument });
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

        // Documents are stored, so the account moves out of the
        // 'pending_documents' state into 'pending_review'. That is the extent of
        // what this route is allowed to do — approval itself (is_verified /
        // is_approved = true, verification_status = 'approved') is granted only
        // by the admin verification flow. Removing the old auto-approve step is
        // the whole point of this fix.
        const { error: stateErr } = await supabase
          .from('tradespeople')
          .update({
            verification_status: 'pending_review',
            is_verified: false,
            is_approved: false,
            is_active: true,
          })
          .eq('id', userId);
        if (stateErr) {
          console.error('Failed to move registration to pending_review:', stateErr);
        }

        // 5. Best-effort machine read of each uploaded document (Phase 2b).
        // The documents rows above are written 'pending' — the honest default.
        // parseDocumentImage independently reads each file via Gemini (same REST
        // pattern as lib/verification/ai-verify.ts) and, ONLY on a high-confidence,
        // type-consistent parse, promotes documents.status to 'approved' and
        // writes the machine-extracted expiry_date / doc_number. Those promoted
        // rows are exactly what evaluateVerificationState
        // (lib/verification/user-status-machine.ts) consumes when the admin
        // verification flow later runs the verdict; a failed, low-confidence or
        // not-attempted parse leaves the doc 'pending', so the account honestly
        // stays in pending_review — never a silent pass.
        //
        // Non-fatal, mirroring the geocode/notification legs below: registration
        // must succeed even if the parser is down or the phase15 parse columns
        // have not been migrated yet, so a parse outage can never block signup.
        // The tradesperson is registered and in review either way.
        if (ocrCandidates.length > 0) {
          for (const candidate of ocrCandidates) {
            try {
              const buffer = Buffer.from(await candidate.file.arrayBuffer());
              const parse = await parseDocumentImage({
                expectedDocType: candidate.docType,
                fileName: candidate.file.name,
                mimeType: candidate.file.type,
                buffer,
              });
              if (!parse) continue; // no GEMINI_API_KEY — parse_status stays NULL

              const patch: Record<string, unknown> = {
                parse_status: parse.parseStatus,
                parsed_at: new Date().toISOString(),
              };
              if (parse.payload) {
                patch.parse_payload = parse.payload;
              }
              if (parse.promote && parse.payload) {
                patch.status = 'approved';
                if (parse.payload.docNumber) patch.doc_number = parse.payload.docNumber;
                if (parse.payload.expiryDate) patch.expiry_date = parse.payload.expiryDate;
              }

              const { error: parseErr } = await supabase
                .from('documents')
                .update(patch)
                .eq('id', candidate.rowId);

              if (parseErr) {
                // PostgREST names the first missing column it hits. If the
                // phase15 parse columns have not been created yet, further docs
                // would fail identically — stop rather than burn a Gemini call
                // per row (documents stay pending, account stays in review).
                const message = `${parseErr.message || ''} ${parseErr.details || ''}`;
                if (/parse_status|parse_payload|parsed_at/i.test(message)) {
                  console.warn(
                    '[trades/register] Document parse columns missing — run ' +
                      'sql/phase15-document-ocr.sql; documents stay pending and ' +
                      'the account remains in pending_review.',
                    parseErr
                  );
                  break;
                }
                console.error(
                  `[trades/register] Failed to persist parse for ${candidate.docType} document:`,
                  parseErr
                );
              }
            } catch (e) {
              console.error(
                '[trades/register] Document OCR leg failed (non-fatal):',
                e instanceof Error ? e.message : String(e)
              );
            }
          }
        }
      }
    } else {
      console.log('Skipping document uploads - bucket not available');
    }

    // Signup acknowledgement (idempotent). The copy is deliberately honest: the
    // account is in review, not live. The "you're approved" notifications
    // (tradesperson_next_steps, profile_live_alert) are sent only by the admin
    // verification flow once a human actually approves the account — they must
    // never fire at signup, because nothing has been approved yet.
    try {
      await sendNotification({
        type: 'tradesperson_signup_confirmation',
        recipientId: String(userId),
        recipientEmail: email,
        recipientPhone: phone,
        channels: ['email', 'push'],
        idempotencyKey: `tradesperson_signup_confirmation:${userId}`,
        data: { firstName: fullName.split(' ')[0] || fullName },
      });
    } catch (notifyErr) {
      console.error('Signup confirmation notification failed (non-fatal):', notifyErr);
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
        'Registration received! Your documents are now in review — you will receive an email once your profile is approved and live.',
      subscriptionPlan,
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error?.message || String(error),
        stack: error?.stack || 'No stack trace available'
      },
      { status: 500 }
    );
  }
}