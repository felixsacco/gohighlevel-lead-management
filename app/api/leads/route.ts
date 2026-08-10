import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { emitFleetIngest } from '@/lib/fleet/emitFleetIngest';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 503 }
    );
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { name, email, phone, trade, postcode, description, estimate } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        { 
          name: name || null,
          email,
          phone: phone || null,
          trade,
          postcode,
          description,
          estimate,
          status: 'new',
          created_at: new Date().toISOString()
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting lead:', error);
      throw error;
    }

    void emitFleetIngest({
      event_type: 'lead',
      summary: `New lead: ${name || email} (${trade || 'trade unknown'}, ${postcode || 'no postcode'})`,
      payload: { id: data?.[0]?.id, name, email, phone, trade, postcode, estimate },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Lead submitted successfully',
      data 
    });
  } catch (error) {
    console.error('Error submitting lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
