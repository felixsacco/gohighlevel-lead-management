// GoHighLevel OAuth 2.0 Authentication Service
// This service handles OAuth 2.0 authentication with GoHighLevel CRM

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface SendSmsPayload {
  locationId: string;
  to: string;
  message: string;
}

export class GoHighLevelOAuth {
  private config: OAuthConfig;
  private baseUrl: string;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://services.leadconnectorhq.com';
  }

  // Generate authorization URL for OAuth flow
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'contacts.write opportunities.write locations.read',
      state: state || 'default'
    });

    return `https://marketplace.gohighlevel.com/oauth/chooselocation?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OAuth token exchange failed: ${response.status} - ${errorData.error_description || response.statusText}`);
    }

    return await response.json();
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Token refresh failed: ${response.status} - ${errorData.error_description || response.statusText}`);
    }

    return await response.json();
  }

  // Get user's locations
  async getLocations(accessToken: string): Promise<Location[]> {
    const response = await fetch(`${this.baseUrl}/locations/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to get locations: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.locations || [];
  }

  // Test access token validity
  async testToken(accessToken: string): Promise<{ valid: boolean; locationId?: string; locationName?: string }> {
    try {
      const locations = await this.getLocations(accessToken);
      
      if (locations.length > 0) {
        return {
          valid: true,
          locationId: locations[0].id,
          locationName: locations[0].name
        };
      }
      
      return { valid: false };
    } catch (error) {
      console.error('Token test failed:', error);
      return { valid: false };
    }
  }

  // Send SMS via GoHighLevel conversations API (requires contactId — upsert by phone first)
  async sendSms(accessToken: string, payload: SendSmsPayload): Promise<{ messageId: string }> {
    const upsertRes = await fetch(`${this.baseUrl}/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId: payload.locationId,
        phone: payload.to,
        name: 'MyApproved'
      })
    });

    const upsertData = await upsertRes.json().catch(() => ({}));
    if (!upsertRes.ok) {
      throw new Error(`Failed to upsert contact for SMS: ${upsertRes.status} - ${upsertData.message || upsertRes.statusText}`);
    }

    const contactId = upsertData.contact?.id || upsertData.id;
    if (!contactId) {
      throw new Error('GoHighLevel upsert did not return a contact id');
    }

    const response = await fetch(`${this.baseUrl}/conversations/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        type: 'SMS',
        locationId: payload.locationId,
        contactId,
        message: payload.message
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.status} - ${data.message || response.statusText}`);
    }

    return { messageId: data.id || data.messageId || 'gohighlevel' };
  }
}

// Factory function to create OAuth service
export function createGoHighLevelOAuth(clientId: string, clientSecret: string, redirectUri: string) {
  return new GoHighLevelOAuth({
    clientId,
    clientSecret,
    redirectUri,
  });
}

// Default export
export default GoHighLevelOAuth;


