/**
 * Tradesperson Profile SEO Page
 * URL Pattern: /profile/{business-name}-{location}
 *
 * NOTE: This page used to render hard-coded placeholder profiles
 * ("ABC Plumbing", "Quick Fix Electrics") for SEO purposes. That has been
 * removed - we no longer show any mock/placeholder tradespeople. Until real
 * profile slugs are wired up to the database, any /profile/<slug> request
 * resolves to a 404 so that no fake businesses are visible on the live site.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// No static params - we do NOT pre-render any placeholder profile pages.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Profile Not Found | MyApproved',
    robots: { index: false, follow: false }
  }
}

export default function ProfilePage() {
  // No real profile slug routing implemented yet. Always 404 so that no
  // placeholder / sample tradespeople ever appear on production.
  notFound()
}
