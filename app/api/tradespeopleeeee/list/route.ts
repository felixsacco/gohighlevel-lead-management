import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const trade = searchParams.get('trade') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    
    // Fix pagination parameters with proper validation
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const page = pageParam && !isNaN(parseInt(pageParam)) ? parseInt(pageParam) : 1;
    const limit = limitParam && !isNaN(parseInt(limitParam)) ? parseInt(limitParam) : 6;

    console.log('Fetching tradespeople with params:', { searchTerm, location, trade, sortBy, page, limit });

    // Build query with reviews data
    let query = supabase
      .from('tradespeople')
      .select(`
        id,
        first_name,
        last_name,
        trade,
        city,
        postcode,
        phone,
        email,
        profile_picture_url,
        years_experience,
        hourly_rate,
        is_verified,
        is_active,
        is_approved,
        created_at,
        job_reviews!job_reviews_tradesperson_id_fkey (
          id,
          rating,
          review_text,
          reviewer_type,
          reviewer_id,
          reviewed_at
        )
      `)
      .eq('is_active', true) // Only show active tradespeople
      .eq('is_approved', true); // Only show approved tradespeople

    // Add search filters
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,trade.ilike.%${searchTerm}%`);
    }

    if (trade) {
      query = query.eq('trade', trade);
    }

    if (location) {
      query = query.or(`city.ilike.%${location}%,postcode.ilike.%${location}%`);
    }

    // Add sorting - use created_at as default since it should exist
    query = query.order('created_at', { ascending: false });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('Executing query with pagination:', { page, limit, from, to });
    
    // Get total count for pagination
    const { count } = await supabase
      .from('tradespeople')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_approved', true);

    const { data: tradespeople, error } = await query;

    if (error) {
      console.error('Error fetching tradespeople:', error);
      return NextResponse.json(
        { error: `Failed to fetch tradespeople: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Found ${tradespeople?.length || 0} tradespeople`);

    // Hard server-side filter: remove obvious placeholder / test accounts and
    // any record missing the basic data required to publicly list it. This
    // guarantees no mock or test tradespeople reach the public site, even if
    // they slip past the is_active / is_approved flags.
    const PLACEHOLDER_NAME_PATTERN = /\b(test|tester|testing|demo|sample|placeholder|mock|fake|dummy|example|asdf|qwerty|kill|asdas|abcd|xxxx|aaaa)\b/i;
    const isLikelyPlaceholderEmail = (email: string | null | undefined) => {
      if (!email) return false;
      const e = email.toLowerCase();
      return (
        e.includes('test@') ||
        e.includes('+test') ||
        e.endsWith('@test.com') ||
        e.endsWith('@example.com') ||
        e.endsWith('@example.co.uk') ||
        e.endsWith('@mailinator.com')
      );
    };

    const safeTradespeople = (tradespeople || []).filter((person: any) => {
      const firstName = (person.first_name || '').trim();
      const lastName = (person.last_name || '').trim();
      const trade = (person.trade || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();

      // Must have a real first and last name + trade + city
      if (!firstName || !lastName || !trade) return false;
      if (!person.city) return false;

      // Exclude obvious placeholder values
      if (PLACEHOLDER_NAME_PATTERN.test(firstName)) return false;
      if (PLACEHOLDER_NAME_PATTERN.test(lastName)) return false;
      if (PLACEHOLDER_NAME_PATTERN.test(fullName)) return false;
      if (PLACEHOLDER_NAME_PATTERN.test(trade)) return false;
      if (isLikelyPlaceholderEmail(person.email)) return false;

      // Exclude obviously short / gibberish names (e.g. single letters, "aa")
      if (firstName.replace(/[^a-z]/gi, '').length < 2) return false;
      if (lastName.replace(/[^a-z]/gi, '').length < 2) return false;

      return true;
    });

    // Transform the data to match the frontend expectations
    const transformedTradespeople = safeTradespeople.map((person: any) => {
      const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();

      const nameParts = fullName.split(' ').filter((part: string) => part.length > 0);
      const initials = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : (fullName.substring(0, 2) || 'NA').toUpperCase();

      // Calculate real ratings and reviews from job_reviews
      const reviews = person.job_reviews || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0;

      // Honest description (no fabricated experience claims)
      const description = person.trade
        ? `${person.trade}${person.city ? ` based in ${person.city}` : ''}.`
        : '';

      // Format hourly rate - only show when we actually have it
      let hourlyRate = '';
      if (person.hourly_rate !== null && person.hourly_rate !== undefined && person.hourly_rate !== '') {
        const num = typeof person.hourly_rate === 'number' ? person.hourly_rate : parseFloat(person.hourly_rate);
        if (!isNaN(num) && num > 0) {
          hourlyRate = `£${num.toFixed(2)}/hr`;
        }
      }

      return {
        id: person.id,
        name: fullName,
        trade: person.trade,
        rating: parseFloat(averageRating.toFixed(1)) || 0,
        reviews: totalReviews,
        reviewsData: reviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          text: review.review_text,
          reviewerType: review.reviewer_type,
          reviewedAt: review.reviewed_at
        })),
        location: [person.city, person.postcode].filter(Boolean).join(', '),
        distance: '', // No fabricated distances
        image: person.profile_picture_url || null,
        initials,
        verified: person.is_verified || false,
        yearsExperience: typeof person.years_experience === 'number' ? person.years_experience : 0,
        description,
        hourlyRate,
        responseTime: '',
        phone: person.phone || '',
        email: person.email || ''
      };
    });

    const response = {
      success: true,
      tradespeople: transformedTradespeople,
      pagination: {
        page,
        limit,
        // Note: `count` is the raw approved+active count; the visible list
        // can be smaller after placeholder filtering above. We report the
        // filtered length to avoid promising more results than we can show.
        total: transformedTradespeople.length === 0 ? 0 : (count || 0),
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (page * limit) < (count || 0)
      }
    };

    console.log('API Response:', {
      success: response.success,
      tradespeopleCount: response.tradespeople.length,
      pagination: response.pagination
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in tradespeople list API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 