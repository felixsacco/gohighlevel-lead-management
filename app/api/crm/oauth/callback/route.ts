import { NextRequest, NextResponse } from 'next/server';
import { createGoHighLevelOAuth } from '@/lib/gohighlevel-oauth';

// Environment variables for OAuth
const GOHIGHLEVEL_CLIENT_ID = process.env.GOHIGHLEVEL_CLIENT_ID;
const GOHIGHLEVEL_CLIENT_SECRET = process.env.GOHIGHLEVEL_CLIENT_SECRET;
const GOHIGHLEVEL_REDIRECT_URI = process.env.GOHIGHLEVEL_REDIRECT_URI;

export async function GET(request: NextRequest) {
  try {
    // Check if OAuth is configured
    if (!GOHIGHLEVEL_CLIENT_ID || !GOHIGHLEVEL_CLIENT_SECRET || !GOHIGHLEVEL_REDIRECT_URI) {
      return NextResponse.json({
        success: false,
        error: 'OAuth not configured. Please set GOHIGHLEVEL_CLIENT_ID, GOHIGHLEVEL_CLIENT_SECRET, and GOHIGHLEVEL_REDIRECT_URI environment variables.',
        message: 'OAuth disabled'
      }, { status: 500 });
    }

    // Get authorization code from query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({
        success: false,
        error: `OAuth authorization failed: ${error}`,
        message: 'Authorization failed'
      }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Authorization code not provided',
        message: 'Invalid authorization response'
      }, { status: 400 });
    }

    // Create OAuth service
    const oauthService = createGoHighLevelOAuth(
      GOHIGHLEVEL_CLIENT_ID,
      GOHIGHLEVEL_CLIENT_SECRET,
      GOHIGHLEVEL_REDIRECT_URI
    );

    // Exchange code for access token
    const tokenResponse = await oauthService.exchangeCodeForToken(code);

    // Get user's locations
    const locations = await oauthService.getLocations(tokenResponse.access_token);

    if (locations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No locations found for this account',
        message: 'Please ensure your GoHighLevel account has at least one location'
      }, { status: 400 });
    }

    // Return success with token and location info
    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        locations: locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          country: loc.country
        })),
        selectedLocation: locations[0] // Default to first location
      },
      message: 'OAuth authorization successful'
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'OAuth authorization failed'
    }, { status: 500 });
  }
}


