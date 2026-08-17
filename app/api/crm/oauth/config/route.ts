import { NextResponse } from 'next/server';
import { createGoHighLevelOAuth } from '@/lib/gohighlevel-oauth';

// Builds the GHL OAuth authorization URL server-side so the client only ever
// receives the resulting URL — never the OAuth client secret (or client id,
// which can likewise stay out of the browser bundle).
export async function GET() {
  const clientId = process.env.GOHIGHLEVEL_CLIENT_ID;
  const clientSecret = process.env.GOHIGHLEVEL_CLIENT_SECRET;
  const redirectUri =
    process.env.GOHIGHLEVEL_REDIRECT_URI || 'https://myapproved.com/api/crm/oauth/callback';

  if (!clientId) {
    return NextResponse.json(
      { error: 'OAuth is not configured (missing GOHIGHLEVEL_CLIENT_ID).' },
      { status: 500 }
    );
  }

  // generateAuthUrl() only embeds client_id + redirect_uri + scope + state;
  // the secret is passed here to satisfy the constructor signature but is never
  // included in the returned URL.
  const oauth = createGoHighLevelOAuth(clientId, clientSecret || '', redirectUri);
  return NextResponse.json({ authUrl: oauth.generateAuthUrl() });
}
