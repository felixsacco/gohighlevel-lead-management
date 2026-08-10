# GoHighLevel CRM Integration Setup

This guide will help you set up GoHighLevel CRM integration for job submission syncing. We support both **OAuth 2.0** and **Private Integration** methods.

## Prerequisites

1. **GoHighLevel Account**: You need a Pro account or higher to access the API
2. **Choose Integration Method**:
   - **Private Integration** (Recommended): Simple API key-style token
   - **OAuth 2.0**: Full OAuth flow with developer account

## Method 1: Private Integration (Recommended)

This is the simplest method using a Private Integration Token.

### 1. Get Your Private Integration Token

1. Log in to your GoHighLevel account
2. Go to **Settings** (bottom left corner)
3. Click on **API Key** in the left panel
4. Click **"Generate New Key"** for Private Integration
5. Copy your **Private Integration Token** (starts with "pit-")
6. Note your **Location ID** (found in the URL or settings)

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# GoHighLevel CRM Private Integration
GOHIGHLEVEL_API_KEY=pit-78d8b711-5a97-40ee-889a-688bd30f17ce
GOHIGHLEVEL_LOCATION_ID=your_location_id_here
```

### 3. Test the Integration

1. Visit the setup page: `http://localhost:3001/setup-crm-private`
2. Enter your Private Integration Token and Location ID
3. Test the connection
4. Copy the environment variables to your `.env.local` file

You can also test the CRM connection by visiting:
```
GET /api/crm/sync-job
```

## Method 2: OAuth 2.0 (Advanced)

This method requires a developer account and OAuth app setup.

### 1. Create OAuth Application

1. Go to [GoHighLevel Marketplace](https://marketplace.gohighlevel.com/)
2. Sign up for a developer account
3. Go to **"My Apps"** and click **"Create App"**
4. Fill in the required details:
   - **App Name**: MyApproved CRM Integration
   - **Redirect URI**: `http://localhost:3001/api/crm/oauth/callback`
   - **Scopes**: contacts.write, opportunities.write, locations.read
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# GoHighLevel CRM OAuth Integration
GOHIGHLEVEL_CLIENT_ID=your_client_id_here
GOHIGHLEVEL_CLIENT_SECRET=your_client_secret_here
GOHIGHLEVEL_REDIRECT_URI=http://localhost:3001/api/crm/oauth/callback
GOHIGHLEVEL_ACCESS_TOKEN=your_access_token_here
GOHIGHLEVEL_LOCATION_ID=your_location_id_here
```

### 3. Get Access Token

1. Visit the setup page: `http://localhost:3001/setup-crm`
2. Click **"Authorize with GoHighLevel"**
3. Complete the OAuth flow in the popup window
4. Copy the access token from the response
5. Add it to your `.env.local` file
6. Select your GoHighLevel location
7. Test the connection

## How It Works

### Job Submission Sync

When a job is submitted:

1. **Contact Creation**: A new contact is created in GoHighLevel with:
   - Client name and email
   - Phone number (if provided)
   - Location/address
   - Custom fields with job details
   - Tags for easy filtering

2. **Opportunity Creation**: A sales opportunity is created with:
   - Job title and description
   - Budget information
   - Trade type
   - Status mapping
   - Custom fields

### Data Mapping

| Job Field | GoHighLevel Field | Type |
|-----------|------------------|------|
| clientName | firstName, lastName | Contact |
| clientEmail | email | Contact |
| clientPhone | phone | Contact |
| location | address1 | Contact |
| trade | tags, customFields | Contact/Opportunity |
| jobDescription | customFields | Contact/Opportunity |
| budget | monetaryValue | Opportunity |
| status | status | Opportunity |

### Status Mapping

| Job Status | Opportunity Status |
|------------|-------------------|
| pending | New |
| approved | Qualified |
| in_progress | In Progress |
| completed | Won |
| cancelled | Lost |
| rejected | Lost |

## API Endpoints

### Sync Job to CRM
```
POST /api/crm/sync-job
```

**Request Body:**
```json
{
  "id": "job_123",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "+1234567890",
  "trade": "Plumber",
  "jobDescription": "Fix leaking pipe",
  "location": "123 Main St, London",
  "budget": 150,
  "budgetType": "fixed",
  "preferredDate": "2024-01-15",
  "status": "pending",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contactId": "contact_123",
    "opportunityId": "opportunity_456"
  },
  "message": "Job submission synced to GoHighLevel CRM successfully"
}
```

### Test CRM Connection
```
GET /api/crm/sync-job
```

**Response:**
```json
{
  "success": true,
  "locationName": "My Business Location",
  "message": "GoHighLevel API connection successful"
}
```

## Integration in Your App

### 1. Import the CRM sync utility

```typescript
import { syncJobToCRM, retryCRMSync } from '@/lib/crm-sync';
```

### 2. Sync job after submission

```typescript
// After job is created in your database
const jobData = {
  id: job.id,
  clientName: `${client.first_name} ${client.last_name}`,
  clientEmail: client.email,
  clientPhone: client.phone,
  trade: job.trade,
  jobDescription: job.job_description,
  location: job.postcode,
  budget: job.budget,
  budgetType: job.budget_type,
  preferredDate: job.preferred_date,
  status: job.status,
  createdAt: job.created_at
};

// Sync to CRM
const syncResult = await syncJobToCRM(jobData);

if (syncResult.success) {
  console.log('Job synced to CRM:', syncResult.contactId);
} else {
  console.error('CRM sync failed:', syncResult.error);
}
```

### 3. Retry failed syncs

```typescript
// Retry with exponential backoff
const retryResult = await retryCRMSync(jobData, 3, 1000);
```

## Error Handling

The integration includes comprehensive error handling:

- **API Errors**: Network issues, authentication failures
- **Data Validation**: Missing required fields
- **Retry Logic**: Automatic retry with exponential backoff
- **Queue System**: Background processing for failed syncs

## Monitoring

Check the browser console and server logs for:
- Successful syncs
- Failed syncs with error details
- Retry attempts
- Queue processing

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify your API key is correct
2. **Location ID Wrong**: Check your location ID in GoHighLevel
3. **Rate Limiting**: GoHighLevel has rate limits, retry logic handles this
4. **Network Issues**: Check your internet connection

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG_CRM_SYNC=true
```

## Support

- GoHighLevel API Docs: https://marketplace.gohighlevel.com/docs/
- GoHighLevel Developer Community: https://developers.gohighlevel.com/join-dev-community
