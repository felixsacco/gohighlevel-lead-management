import { sendTransactionalEmail } from './email';

// Single, shared "your profile is approved" email, used by BOTH approval writers:
//   - admin-secret/verify-tradesperson (machine verdict → approved)
//   - admin-secret/review-tradesperson (human review → approved)
//
// The callers each gate the send on a genuine transition into approved (never on a
// re-verify of an already-approved profile), so across both routes a tradesperson
// is emailed exactly once. This replaces the old unconditional triple-email in the
// verify route. Phase 4 #18 consolidates the send into one notification_logs event.
export function sendProfileApprovedEmail(opts: {
  to: string;
  firstName: string | null;
  lastName: string | null;
  trade: string | null;
  city: string | null;
  postcode: string | null;
  yearsExperience: number | null;
}) {
  const {
    to,
    firstName,
    lastName,
    trade,
    city,
    postcode,
    yearsExperience,
  } = opts;

  return sendTransactionalEmail({
    to,
    subject: 'Your Profile Has Been Verified - My Approved',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#2d3748;">Congratulations!</h2>
      <p>Dear ${firstName ?? ''} ${lastName ?? ''},</p>
      <p>Great news! Your tradesperson profile has been verified and approved.</p>
      <p>You can now log in to your profile and start receiving job requests from clients.</p>
      <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
        <h3 style="margin-top:0;">Your Profile Details:</h3>
        <p><strong>Trade:</strong> ${trade ?? ''}</p>
        <p><strong>Location:</strong> ${city ?? ''}, ${postcode ?? ''}</p>
        <p><strong>Experience:</strong> ${yearsExperience ?? ''} years</p>
      </div>
      <p>Thank you for choosing My Approved!</p>
      <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
    </div>`,
  });
}
