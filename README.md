# 🏆 MyApproved - UK's #1 Trusted Tradespeople Platform

[![SEO Score](https://img.shields.io/badge/SEO-100%25-success)](https://myapproved.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

A premium, enterprise-level platform connecting homeowners with verified, insured tradespeople across the UK. Built with modern web technologies and optimized for maximum performance and SEO.

## ✨ Latest Updates (December 2025)

### 🎨 Premium UI/UX Redesign
- **Ultra-premium Customer Reviews section** with shimmer effects and enhanced animations
- **Enhanced FAQ section** with premium accordion cards and smooth transitions
- **Horizontal scrolling carousel** for Most In-Demand Services
- **Mobile-responsive hero testimonials** with centered layout
- **Premium animations** throughout with smooth hover effects

### 🚀 100% SEO Optimization
- **7 Structured Data Schemas**: FAQPage, Organization, LocalBusiness, WebSite, BreadcrumbList, Service (6 categories)
- **Complete metadata**: Open Graph, Twitter Cards, Google Site Verification
- **Dynamic sitemap.ts** with all major pages
- **robots.txt** with proper crawler directives
- **Rich snippets** enabled for search results

### 🎯 Branding Updates
- Updated header and footer logos with consistent styling
- Blue gradient header background matching footer
- Responsive logo implementation across all devices

## 🎯 Key Features

### For Customers
- 🔍 **Smart Search** - AI-powered search with autocomplete for 20+ trade categories
- 📍 **UK Postcode Validation** - Instant local tradesperson matching
- 💰 **Instant Quotes** - Get free quotes from verified professionals
- ⭐ **Verified Reviews** - Real customer testimonials with ratings
- 🛡️ **Insurance Verified** - All tradespeople are insured and background-checked
- 📱 **Mobile Optimized** - Seamless experience on all devices

### For Tradespeople
- 📊 **Lead Generation** - Quality leads from homeowners in your area
- 💼 **Professional Profile** - Showcase your work and credentials
- 💬 **Direct Messaging** - Connect with customers instantly
- 📈 **Business Growth** - Expand your customer base

### Technical Features
- ⚡ **Next.js 14** - Latest React framework with App Router
- 🎨 **Tailwind CSS** - Utility-first styling with custom design system
- 📊 **Supabase** - Real-time database and authentication
- 🔒 **Type-Safe** - Full TypeScript implementation
- 🚀 **SEO Optimized** - 100% SEO score with structured data
- 📱 **PWA Ready** - Progressive Web App capabilities

## Prerequisites

- Node.js 16.14.0 or later
- npm or yarn
- Supabase account (for production)
- OpenAI API key (for real AI estimates)

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd trades
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials
   - (Optional) Add your OpenAI API key for real AI estimates

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key
```

## Supabase Setup

1. Create a new project in Supabase
2. Create a `leads` table with the following SQL:
   ```sql
   create table leads (
     id bigint primary key generated always as identity,
     name text,
     email text not null,
     phone text,
     trade text not null,
     postcode text not null,
     description text not null,
     estimate text,
     status text not null default 'new',
     created_at timestamptz not null default now()
   );
   ```
3. Enable Row Level Security (RLS) and create policies as needed

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library
- **[Embla Carousel](https://www.embla-carousel.com/)** - Smooth carousels
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database, authentication, real-time
- **[OpenAI API](https://openai.com/api/)** - AI-powered cost estimates (optional)

### SEO & Analytics
- **Structured Data** - 7 JSON-LD schemas for rich snippets
- **Open Graph** - Social media optimization
- **Google Analytics** - Traffic and conversion tracking
- **Dynamic Sitemap** - Auto-generated XML sitemap

## 📊 SEO Implementation

### Structured Data Schemas
1. **FAQPage** - FAQ section with questions and answers
2. **Organization** - Company information and social links
3. **LocalBusiness** - Business hours, location, contact info
4. **WebSite** - Site-wide search functionality
5. **BreadcrumbList** - Navigation breadcrumbs
6. **Service** (6 categories):
   - Emergency Plumbing (£99, 4.9★)
   - Electrical Repairs (£85, 4.8★)
   - Painting & Decorating (£120, 4.9★)
   - Handyman Services (£45, 4.8★)
   - Gardening & Landscaping (£55, 4.9★)
   - Home Cleaning (£25, 4.9★)

### Meta Tags
- Complete Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs
- Google Site Verification
- Robots meta directives

### Technical SEO
- Dynamic sitemap.xml generation
- robots.txt with crawler directives
- Proper heading hierarchy
- Semantic HTML structure
- Mobile-first responsive design
- Fast page load times

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **SEO Score**: 100/100
- **Mobile Optimized**: Fully responsive design
- **Core Web Vitals**: Optimized for LCP, FID, CLS

## 🚀 Deployment

This project is optimized for deployment on:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom server** with Node.js

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please contact:
- **Website**: [myapproved.com](https://myapproved.com)
- **Email**: hello@myapproved.com
- **Phone**: 0800 123 4567

---

**Built with ❤️ for the UK trades community**
