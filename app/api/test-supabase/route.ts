import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Test connection by trying to fetch clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, email')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      clients: clients
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}