# Email Setup Guide

MyApproved sends transactional email (verification codes, job alerts, notifications) via **GoDaddy SMTP** using `nodemailer`. There is no Gmail integration.

## Architecture

- **Library:** `lib/notifications/email.ts`
- **Layout/templates:** `lib/notifications/email-layout.ts`, `lib/notifications/admin-inbox.ts`
- **Transport:** TLS over `smtpout.secureserver.net:465`

## Environment Variables

Set these in `.env.local` (never commit real values — `.env` / `.env.example` are blank templates):

| Variable | Value | Notes |
|---|---|---|
| `SMTP_HOST` | `smtpout.secureserver.net` | GoDaddy Workspace Email SMTP |
| `SMTP_PORT` | `465` | SSL. Falls back to code default. |
| `SMTP_USER` | `noreply@myapproved.com` | Sending mailbox |
| `SMTP_PASS` | *(GoDaddy mailbox password)* | Provisioned manually in the GoDaddy dashboard |
| `NOTIFICATION_FROM_EMAIL` | `noreply@myapproved.com` | From address on outbound notifications |
| `ADMIN_EMAIL` | your admin inbox | Internal alerts / dispute notifications |
| `SUPPORT_EMAIL` | `support@myapproved.com` | User-facing support address |

## How It Fails Safe

`lib/notifications/email.ts` guards on credential presence: if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are absent, it logs a warning and returns without throwing. No email is attempted without a configured credential.

## Testing

Use the `/test-email` and `/test-email-admin` development routes to verify delivery. Trigger a registration or job submission to confirm end-to-end email delivery.

> For the full current integration map see `docs/API_INVENTORY.md` (§3.3 GoDaddy SMTP).
