import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing basic connection...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test basic fetch to Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Supabase response status:', response.status);
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Supabase connection successful',
        status: response.status
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Supabase connection failed',
        status: response.status,
        statusText: response.statusText
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}