/**
 * Shared HTML shell and job reference formatting for MyApproved transactional email.
 * UK-style segmented references (stable from job UUID); no raw UUIDs in customer-facing copy.
 */

export function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SUPPORT =
  process.env.SUPPORT_EMAIL?.trim() || "support@myapproved.com";
const LOGO_SRC_PLACEHOLDER = "__MYAPPROVED_LOGO_SRC__";

/** Sequential job reference (e.g. MA-000142) from the jobs.reference_code column. */
export function formatJobReference(referenceCode: unknown): string {
  const s = String(referenceCode || "").trim();
  return /^MA-\d{6,}$/.test(s) ? s : "";
}

export function jobReferenceRowHtml(ref: string): string {
  if (!ref?.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
  <tr><td style="padding:14px 18px;">
    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-family:Arial,Helvetica,sans-serif;">Job reference</div>
    <div style="font-size:17px;font-weight:700;color:#0f172a;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.02em;">${ref}</div>
  </td></tr>
</table>`;
}

/** Wrap inner HTML fragment in MyApproved UK-style transactional layout. */
export function wrapBrandedEmailHtml(innerBody: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>MyApproved</title>
</head>
<body style="margin:0;padding:0;background:#e2e8f0;-webkit-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e2e8f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #cbd5e1;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="padding:24px 28px;background:#ffffff;border-bottom:1px solid #e2e8f0;text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${LOGO_SRC_PLACEHOLDER}" alt="My Approved" style="display:block;width:34px;height:34px;border:0;outline:none;text-decoration:none;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:36px;line-height:1;font-weight:800;color:#f4c22a;letter-spacing:0.2px;">MyApproved</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#334155;">
              ${innerBody}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#f1f5f9;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.55;color:#64748b;">
              This message was sent by <strong style="color:#475569;">MyApproved</strong> in connection with your account or an active enquiry on our platform.<br /><br />
              <strong>Support:</strong> <a href="mailto:${SUPPORT}" style="color:#0369a1;">${SUPPORT}</a><br />
              Please quote your <strong>job reference</strong> (above, if shown) in any reply so we can assist without delay.<br /><br />
              &copy; ${year} MyApproved. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function injectEmailLogoSrc(html: string, logoSrc: string): string {
  return html.replaceAll(LOGO_SRC_PLACEHOLDER, logoSrc);
}
