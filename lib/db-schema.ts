/**
 * MyApproved Database Schema & Types
 * Scalable data structure supporting 10,000+ profiles and 100,000+ reviews
 * 
 * This file defines TypeScript interfaces and mock data structures
 * that can be easily migrated to a real database (PostgreSQL, MongoDB, etc.)
 */

// ============================================================================
// CORE TRADE DATA (extends seo-data.ts)
// ============================================================================

export interface Trade {
  id: string
  slug: string
  name: string
  plural: string
  category: string
  description: string
  services: string[]
  keywords: string[]
  hourlyRate: string
  priority: number
  icon?: string
  contentSections?: {
    introduction: string
    whatWeDo: string
    whyHire: string
    typicalJobs: string[]
    faqs: { q: string; a: string }[]
  }
}

// ============================================================================
// LOCATION DATA
// ============================================================================

export interface Location {
  id: string
  name: string
  slug: string
  region: string
  country: string
  population: number
  priority: number
  postcodes: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  contentSections?: {
    introduction: string
    about: string
    localTips: string[]
  }
}

// ============================================================================
// TRADESPERSON PROFILE
// ============================================================================

export interface TradespersonProfile {
  // Core Identity
  id: string
  slug: string
  businessName: string
  tradeId: string
  tradeSlug: string
  
  // Location
  locationId: string
  locationName: string
  locationSlug: string
  region: string
  address: string
  postcodes: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Business Details
  tagline: string
  description: string
  yearsInBusiness: number
  establishedYear: number
  businessType: 'sole-trader' | 'partnership' | 'limited-company'
  
  // Contact
  phone: string
  email: string
  website?: string
  whatsapp?: string
  
  // Verification & Trust
  verificationStatus: 'pending' | 'verified' | 'premium'
  verifiedDate?: string
  idVerified: boolean
  addressVerified: boolean
  qualifications: Qualification[]
  insurance: InsurancePolicy[]
  memberships: string[] // NICEIC, Gas Safe, etc.
  
  // Services
  servicesOffered: string[]
  specialisms: string[]
  emergencyServices: boolean
  emergencyHourlyRate?: string
  
  // Coverage
  serviceRadius: number // miles
  areasCovered: string[]
  
  // Availability
  workingHours: WorkingHours
  availability: 'standard' | 'extended' | '24-7'
  typicalResponseTime: string
  
  // Reviews & Ratings
  rating: number // 1-5
  reviewCount: number
  reviews: Review[]
  ratingBreakdown: {
    five: number
    four: number
    three: number
    two: number
    one: number
  }
  
  // Portfolio
  portfolio: PortfolioItem[]
  
  // Social Proof
  testimonials: Testimonial[]
  
  // Jobs & Leads
  completedJobs: number
  responseRate: number // percentage
  averageQuoteResponse: string
  
  // SEO & Content
  seoTitle?: string
  seoDescription?: string
  metaKeywords?: string[]
  
  // Status
  status: 'active' | 'paused' | 'suspended'
  subscriptionTier: 'free' | 'basic' | 'pro' | 'premium'
  featured: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

export interface Qualification {
  id: string
  name: string
  issuingBody: string
  certificateNumber?: string
  issueDate: string
  expiryDate?: string
  verified: boolean
  documentUrl?: string
}

export interface InsurancePolicy {
  id: string
  type: 'public-liability' | 'employers-liability' | 'professional-indemnity' | 'tool-cover' | 'van-cover'
  provider: string
  policyNumber: string
  coverageAmount: string
  startDate: string
  expiryDate: string
  verified: boolean
  documentUrl?: string
}

export interface WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  available: boolean
  start?: string // HH:MM format
  end?: string // HH:MM format
}

// ============================================================================
// REVIEW SYSTEM
// ============================================================================

export interface Review {
  id: string
  profileId: string
  
  // Reviewer Info
  reviewerName: string
  reviewerLocation?: string
  reviewerType: 'homeowner' | 'landlord' | 'business'
  verified: boolean
  verifiedMethod: 'phone' | 'email' | 'receipt' | 'manual'
  
  // Review Content
  rating: number // 1-5
  title: string
  content: string
  jobType: string
  jobValue?: string
  jobDate: string
  
  // Additional Details
  pros?: string[]
  cons?: string[]
  wouldRecommend: boolean
  hireAgain: boolean
  
  // Media
  photos?: ReviewPhoto[]
  
  // Response
  businessResponse?: {
    content: string
    respondedAt: string
  }
  
  // SEO
  helpful: number
  reported: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface ReviewPhoto {
  id: string
  url: string
  caption?: string
  uploadedAt: string
}

// ============================================================================
// PORTFOLIO & TESTIMONIALS
// ============================================================================

export interface PortfolioItem {
  id: string
  title: string
  description: string
  tradeCategory: string
  services: string[]
  location: string
  completionDate: string
  duration: string
  value?: string
  
  // Media
  beforeImages?: string[]
  afterImages: string[]
  
  // SEO
  slug: string
  featured: boolean
}

export interface Testimonial {
  id: string
  clientName: string
  clientLocation?: string
  content: string
  rating: number
  jobType: string
  date: string
  featured: boolean
}

// ============================================================================
// BLOG SYSTEM
// ============================================================================

export interface BlogPost {
  id: string
  slug: string
  
  // Content
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  content: BlogContent
  
  // Categorisation
  category: string
  tags: string[]
  relatedTrades: string[]
  relatedLocations: string[]
  
  // Media
  featuredImage: string
  images?: string[]
  
  // Author
  authorId: string
  authorName: string
  authorBio?: string
  
  // SEO
  keywords: string[]
  canonicalUrl?: string
  
  // Status
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  
  // Engagement
  views: number
  shares: number
  
  // Timestamps
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export interface BlogContent {
  introduction: string
  sections: BlogSection[]
  faqs: FAQ[]
  ctaText?: string
}

export interface BlogSection {
  heading: string
  content: string
  tips?: string[]
  image?: string
}

export interface FAQ {
  question: string
  answer: string
}

// ============================================================================
// LEAD/JOB SYSTEM
// ============================================================================

export interface JobLead {
  id: string
  
  // Job Details
  tradeId: string
  serviceType: string
  description: string
  location: string
  postcode: string
  
  // Timing
  urgency: 'emergency' | 'urgent' | 'standard' | 'flexible'
  preferredStart: string
  budget?: string
  
  // Property
  propertyType: 'house' | 'flat' | 'bungalow' | 'commercial'
  propertyAge?: string
  
  // Contact
  contactName: string
  contactPhone: string
  contactEmail: string
  
  // Status
  status: 'new' | 'quoted' | 'accepted' | 'completed' | 'cancelled'
  
  // Matches
  matchedProfiles: string[]
  quotes: Quote[]
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  profileId: string
  jobId: string
  amount: string
  description: string
  includesMaterials: boolean
  validUntil: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

export interface SearchFilters {
  trade?: string
  location?: string
  service?: string
  availability?: 'any' | 'today' | 'this-week' | 'this-month'
  rating?: number
  verified?: boolean
  emergency?: boolean
  priceRange?: {
    min?: number
    max?: number
  }
}

export interface SearchResult {
  profile: TradespersonProfile
  relevanceScore: number
  distance?: number
  availabilityMatch: boolean
}

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

export interface PageView {
  id: string
  pageType: 'trade' | 'location' | 'trade-location' | 'profile' | 'blog' | 'static'
  pageId: string
  url: string
  referrer?: string
  userAgent?: string
  timestamp: string
}

export interface SearchQuery {
  id: string
  query: string
  filters: SearchFilters
  resultsCount: number
  clickedProfileIds: string[]
  converted: boolean
  timestamp: string
}

// ============================================================================
// MOCK DATA GENERATORS (for development)
// ============================================================================

export function generateMockProfile(overrides: Partial<TradespersonProfile> = {}): TradespersonProfile {
  const now = new Date().toISOString()
  
  return {
    id: `prof_${Math.random().toString(36).substr(2, 9)}`,
    slug: 'sample-profile-london',
    businessName: 'Sample Trade Services',
    tradeId: 'trade_plumber',
    tradeSlug: 'plumber',
    locationId: 'loc_london',
    locationName: 'London',
    locationSlug: 'london',
    region: 'Greater London',
    address: '123 Sample Street, London, SW1A 1AA',
    postcodes: ['SW1', 'SW2', 'SE1'],
    tagline: 'Professional plumbing services with 10 years experience',
    description: 'We are a family-run plumbing business serving London for over a decade. Specialising in emergency repairs, boiler installations, and bathroom renovations.',
    yearsInBusiness: 10,
    establishedYear: 2014,
    businessType: 'limited-company',
    phone: '020 7123 4567',
    email: 'info@sampletrades.co.uk',
    website: 'https://sampletrades.co.uk',
    verificationStatus: 'verified',
    verifiedDate: '2023-06-15',
    idVerified: true,
    addressVerified: true,
    qualifications: [
      {
        id: 'qual_1',
        name: 'Gas Safe Registered',
        issuingBody: 'Gas Safe Register',
        verified: true,
        issueDate: '2023-01-01'
      }
    ],
    insurance: [
      {
        id: 'ins_1',
        type: 'public-liability',
        provider: 'Trade Direct',
        policyNumber: 'PL123456',
        coverageAmount: '£5,000,000',
        startDate: '2023-01-01',
        expiryDate: '2024-12-31',
        verified: true
      }
    ],
    memberships: ['Gas Safe Register', 'WaterSafe'],
    servicesOffered: ['Emergency Plumbing', 'Boiler Repair', 'Bathroom Installation'],
    specialisms: ['Emergency Repairs', 'Boiler Specialists'],
    emergencyServices: true,
    emergencyHourlyRate: '£120',
    serviceRadius: 15,
    areasCovered: ['Central London', 'South London', 'East London'],
    workingHours: {
      monday: { available: true, start: '08:00', end: '18:00' },
      tuesday: { available: true, start: '08:00', end: '18:00' },
      wednesday: { available: true, start: '08:00', end: '18:00' },
      thursday: { available: true, start: '08:00', end: '18:00' },
      friday: { available: true, start: '08:00', end: '18:00' },
      saturday: { available: true, start: '09:00', end: '16:00' },
      sunday: { available: false }
    },
    availability: 'extended',
    typicalResponseTime: '30 minutes',
    rating: 4.8,
    reviewCount: 127,
    reviews: [],
    ratingBreakdown: { five: 110, four: 12, three: 3, two: 1, one: 1 },
    portfolio: [],
    testimonials: [],
    completedJobs: 850,
    responseRate: 95,
    averageQuoteResponse: '2 hours',
    status: 'active',
    subscriptionTier: 'pro',
    featured: true,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    ...overrides
  }
}

export function generateMockReview(overrides: Partial<Review> = {}): Review {
  const now = new Date().toISOString()
  
  return {
    id: `rev_${Math.random().toString(36).substr(2, 9)}`,
    profileId: 'prof_sample',
    reviewerName: 'John Smith',
    reviewerLocation: 'London',
    reviewerType: 'homeowner',
    verified: true,
    verifiedMethod: 'receipt',
    rating: 5,
    title: 'Excellent service',
    content: 'Very professional and efficient. Fixed my boiler quickly and explained everything clearly. Would definitely recommend.',
    jobType: 'Boiler Repair',
    jobValue: '£250',
    jobDate: '2024-01-10',
    wouldRecommend: true,
    hireAgain: true,
    helpful: 12,
    reported: false,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}

// ============================================================================
// DATABASE QUERY HELPERS (interface definitions for future DB implementation)
// ============================================================================

export interface ProfileQueryOptions {
  limit?: number
  offset?: number
  filters?: SearchFilters
  sortBy?: 'rating' | 'distance' | 'response-time' | 'completed-jobs' | 'featured'
  sortOrder?: 'asc' | 'desc'
}

export interface ProfileQueryResult {
  profiles: TradespersonProfile[]
  total: number
  hasMore: boolean
}

// These would be implemented with actual database calls in production
export interface DatabaseService {
  // Profiles
  getProfileBySlug(slug: string): Promise<TradespersonProfile | null>
  getProfileById(id: string): Promise<TradespersonProfile | null>
  searchProfiles(options: ProfileQueryOptions): Promise<ProfileQueryResult>
  createProfile(profile: Omit<TradespersonProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<TradespersonProfile>
  updateProfile(id: string, updates: Partial<TradespersonProfile>): Promise<TradespersonProfile>
  
  // Reviews
  getReviewsByProfileId(profileId: string, limit?: number): Promise<Review[]>
  createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review>
  markReviewHelpful(reviewId: string): Promise<void>
  
  // Trades & Locations
  getAllTrades(): Promise<Trade[]>
  getAllLocations(): Promise<Location[]>
  getTradeBySlug(slug: string): Promise<Trade | null>
  getLocationBySlug(slug: string): Promise<Location | null>
  
  // Blog
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>
  getAllBlogPosts(options?: { category?: string; featured?: boolean; limit?: number }): Promise<BlogPost[]>
  
  // Leads
  createJobLead(lead: Omit<JobLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobLead>
  getLeadsByProfileId(profileId: string): Promise<JobLead[]>
}
