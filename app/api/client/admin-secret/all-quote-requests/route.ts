import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }

    // Fetch all quote requests with tradesperson details (for overview)
    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        tradespeople: tradesperson_id (
          id,
          first_name,
          last_name,
          trade,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all quote requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quote requests' },
        { status: 500 }
      );
    }

    // Transform the data to include tradesperson name
    const transformedRequests = quoteRequests?.map(request => ({
      ...request,
      tradespersonName: request.tradespeople 
        ? `${request.tradespeople.first_name} ${request.tradespeople.last_name}`
        : 'Unknown Tradesperson',
      tradespersonTrade: request.tradespeople?.trade || 'Unknown Trade'
    })) || [];

    return NextResponse.json({
      success: true,
      quoteRequests: transformedRequests
    });

  } catch (error: any) {
    console.error('Error in admin all quote requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 