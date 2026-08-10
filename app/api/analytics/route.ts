import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log analytics event (in production, send to analytics service)
    const analyticsEvent = {
      ...body,
      ip: request.ip || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // GA4 is the sole analytics provider. Events are tracked client-side
    // via gtag in lib/analytics.ts. This endpoint serves as a server-side
    // relay for events that need backend-side logging.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
