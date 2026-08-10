import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/companies-house';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results = await searchCompanies(query, 8);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Companies House search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
