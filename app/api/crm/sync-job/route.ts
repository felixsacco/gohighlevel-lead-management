import { NextRequest, NextResponse } from 'next/server';
import { createGoHighLevelService, createGoHighLevelPrivateService } from '@/lib/gohighlevel-service';

// Environment variables for GoHighLevel CRM
const GOHIGHLEVEL_ACCESS_TOKEN = process.env.GOHIGHLEVEL_ACCESS_TOKEN;
const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY; // Private Integration token
const GOHIGHLEVEL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;

export async function POST(request: NextRequest) {
  try {
    // Check if GoHighLevel is configured (either OAuth or Private Integration)
    const hasOAuthToken = GOHIGHLEVEL_ACCESS_TOKEN && GOHIGHLEVEL_LOCATION_ID;
    const hasPrivateToken = GOHIGHLEVEL_API_KEY && GOHIGHLEVEL_LOCATION_ID;
    
    if (!hasOAuthToken && !hasPrivateToken) {
      return NextResponse.json({
        success: false,
        error: 'GoHighLevel CRM not configured. Please set either GOHIGHLEVEL_ACCESS_TOKEN (OAuth) or GOHIGHLEVEL_API_KEY (Private Integration) and GOHIGHLEVEL_LOCATION_ID environment variables.',
        message: 'CRM sync disabled'
      }, { status: 500 });
    }

    // Parse request body
    const jobData = await request.json();

    // Validate required fields
    const requiredFields = ['id', 'clientName', 'clientEmail', 'trade', 'jobDescription', 'location', 'status', 'createdAt'];
    const missingFields = requiredFields.filter(field => !jobData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        message: 'Invalid job data'
      }, { status: 400 });
    }

    // Create GoHighLevel service instance (OAuth or Private Integration)
    const goHighLevelService = hasPrivateToken 
      ? createGoHighLevelPrivateService(GOHIGHLEVEL_API_KEY!, GOHIGHLEVEL_LOCATION_ID!)
      : createGoHighLevelService(GOHIGHLEVEL_ACCESS_TOKEN!, GOHIGHLEVEL_LOCATION_ID!);

    // Sync job submission to GoHighLevel CRM
    const syncResult = await goHighLevelService.syncJobSubmission(jobData);

    if (syncResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          contactId: syncResult.contactId,
          opportunityId: syncResult.opportunityId
        },
        message: syncResult.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: syncResult.error,
        message: syncResult.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('CRM sync error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to sync job submission to CRM'
    }, { status: 500 });
  }
}

// Test CRM connection endpoint
export async function GET() {
  try {
    // Check if GoHighLevel is configured (either OAuth or Private Integration)
    const hasOAuthToken = GOHIGHLEVEL_ACCESS_TOKEN && GOHIGHLEVEL_LOCATION_ID;
    const hasPrivateToken = GOHIGHLEVEL_API_KEY && GOHIGHLEVEL_LOCATION_ID;
    
    if (!hasOAuthToken && !hasPrivateToken) {
      return NextResponse.json({
        success: false,
        error: 'GoHighLevel CRM not configured',
        message: 'CRM sync disabled'
      }, { status: 500 });
    }

    // Create GoHighLevel service instance (OAuth or Private Integration)
    const goHighLevelService = hasPrivateToken 
      ? createGoHighLevelPrivateService(GOHIGHLEVEL_API_KEY!, GOHIGHLEVEL_LOCATION_ID!)
      : createGoHighLevelService(GOHIGHLEVEL_ACCESS_TOKEN!, GOHIGHLEVEL_LOCATION_ID!);

    // Test connection
    const testResult = await goHighLevelService.testConnection();

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('CRM connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to test CRM connection'
    }, { status: 500 });
  }
}
