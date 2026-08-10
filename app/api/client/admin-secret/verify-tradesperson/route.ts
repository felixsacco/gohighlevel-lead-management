import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { sendTransactionalEmail } from '@/lib/notifications/email';
import { getCompanyProfile } from '@/lib/companies-house';
import { aiVerifyTradesperson } from '@/lib/verification/ai-verify';

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const { tradespersonId } = await request.json();

    if (!tradespersonId) {
      return NextResponse.json(
        { error: 'Tradesperson ID is required' },
        { status: 400 }
      );
    }

    // Get tradesperson details
    const { data: tradesperson, error: fetchError } = await supabaseAdmin
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (fetchError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 }
      );
    }

    // Optional: cross-check company with Companies House if a company_number exists on the record
    let companiesHouseProfile = null;
    if (tradesperson.company_number) {
      try {
        companiesHouseProfile = await getCompanyProfile(tradesperson.company_number);
        if (companiesHouseProfile) {
          console.log('Companies House verification:', {
            companyNumber: companiesHouseProfile.companyNumber,
            companyName: companiesHouseProfile.companyName,
            status: companiesHouseProfile.status,
          });
        } else {
          console.warn('Companies House lookup returned no match for:', tradesperson.company_number);
        }
      } catch (chError) {
        console.error('Companies House cross-check failed (non-blocking):', chError);
      }
    }

    // AI-powered verification risk assessment (non-blocking)
    try {
      const { data: documents } = await supabaseAdmin
        .from('documents')
        .select('doc_type, status, expiry_date, doc_number')
        .eq('trade_id', tradespersonId);

      const aiResult = await aiVerifyTradesperson({
        tradespersonId,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name,
        email: tradesperson.email,
        phone: tradesperson.phone,
        trade: tradesperson.trade,
        city: tradesperson.city,
        postcode: tradesperson.postcode,
        yearsExperience: tradesperson.years_experience ?? null,
        companyNumber: tradesperson.company_number ?? null,
        documents: (documents || []).map((d: any) => ({
          docType: d.doc_type,
          status: d.status,
          expiryDate: d.expiry_date,
          docNumber: d.doc_number,
        })),
        companiesHouseProfile,
      });

      if (aiResult) {
        console.log('[verify][ai] Risk assessment:', {
          riskLevel: aiResult.riskLevel,
          riskScore: aiResult.riskScore,
          confidence: aiResult.confidence,
          flags: aiResult.flags,
          summary: aiResult.summary,
        });
      }
    } catch (aiError) {
      console.error('[verify][ai] AI verification assessment failed (non-blocking):', aiError);
    }

    // Update tradesperson to approved
    const { error: updateError } = await supabaseAdmin
      .from('tradespeople')
      .update({ 
        is_approved: true,
        is_verified: true,
        is_active: true,
        verification_status: 'approved'
      })
      .eq('id', tradespersonId);

    if (updateError) {
      console.error('Error updating tradesperson:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve tradesperson' },
        { status: 500 }
      );
    }

    try {
      const result = await sendTransactionalEmail({
        to: tradesperson.email,
        subject: 'Your Profile Has Been Verified - My Approved',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#2d3748;">Congratulations!</h2>
          <p>Dear ${tradesperson.first_name} ${tradesperson.last_name},</p>
          <p>Great news! Your tradesperson profile has been verified and approved by our admin team.</p>
          <p>You can now log in to your profile and start receiving job requests from clients.</p>
          <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
            <h3 style="margin-top:0;">Your Profile Details:</h3>
            <p><strong>Trade:</strong> ${tradesperson.trade}</p>
            <p><strong>Location:</strong> ${tradesperson.city}, ${tradesperson.postcode}</p>
            <p><strong>Experience:</strong> ${tradesperson.years_experience} years</p>
          </div>
          <p>Thank you for choosing My Approved!</p>
          <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
        </div>`,
      });
      console.log('Verification email sent successfully:', result.messageId);

      await sendNotification({
        type: 'tradesperson_next_steps',
        recipientId: String(tradesperson.id),
        recipientEmail: tradesperson.email,
        recipientPhone: tradesperson.phone,
        channels: ['email'],
        idempotencyKey: `tradesperson_next_steps:${tradesperson.id}`,
        data: { trade: tradesperson.trade, city: tradesperson.city, postcode: tradesperson.postcode },
      });

      await sendNotification({
        type: 'profile_live_alert',
        recipientId: String(tradesperson.id),
        recipientEmail: tradesperson.email,
        recipientPhone: tradesperson.phone,
        channels: ['email'],
        idempotencyKey: `tradesperson_profile_live:${tradesperson.id}`,
        data: { message: 'Your profile is approved and visible to customers.' },
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      message: 'Tradesperson verified successfully',
      tradesperson: {
        id: tradesperson.id,
        email: tradesperson.email,
        firstName: tradesperson.first_name,
        lastName: tradesperson.last_name
      }
    });

  } catch (error) {
    console.error('Error in verify tradesperson API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 