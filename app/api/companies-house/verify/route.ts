import { NextRequest, NextResponse } from 'next/server';
import { getCompanyProfile } from '@/lib/companies-house';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyNumber = searchParams.get('company_number');

    if (!companyNumber) {
      return NextResponse.json(
        { error: 'Parameter "company_number" is required' },
        { status: 400 }
      );
    }

    const profile = await getCompanyProfile(companyNumber);

    if (!profile) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      company: profile,
    });
  } catch (error) {
    console.error('Companies House verify API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
