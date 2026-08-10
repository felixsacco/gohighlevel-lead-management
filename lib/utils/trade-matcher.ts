/**
 * Trade name matching for job ↔ tradesperson (handles Plumber/Plumbing etc.)
 */

export function normalizeTradeName(trade: string): string {
  return trade.toLowerCase().trim();
}

const TRADE_VARIATIONS: Record<string, string[]> = {
  plumber: ['plumbing', 'plumber'],
  plumbing: ['plumber', 'plumbing'],
  electrician: ['electrical', 'electrician'],
  electrical: ['electrician', 'electrical'],
  carpenter: ['carpentry', 'carpenter'],
  carpentry: ['carpenter', 'carpentry'],
  painter: ['painting', 'painter'],
  painting: ['painter', 'painting'],
  'carpet & flooring': ['carpet', 'flooring', 'carpet & flooring'],
  carpet: ['carpet & flooring', 'carpet'],
  flooring: ['carpet & flooring', 'flooring'],
};

export function tradesMatch(trade1: string, trade2: string): boolean {
  const normalized1 = normalizeTradeName(trade1);
  const normalized2 = normalizeTradeName(trade2);
  if (normalized1 === normalized2) return true;
  const variations1 = TRADE_VARIATIONS[normalized1] || [normalized1];
  const variations2 = TRADE_VARIATIONS[normalized2] || [normalized2];
  return variations1.some((v1) => variations2.includes(v1));
}
