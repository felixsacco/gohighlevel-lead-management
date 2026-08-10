/**
 * UK Postcode Region Matcher
 * Provides client-side postcode region matching for proximity calculations
 */

// UK Postcode Area to Region mapping
const POSTCODE_REGIONS: Record<string, string> = {
  // London
  'E': 'London',
  'EC': 'London',
  'N': 'London',
  'NW': 'London',
  'SE': 'London',
  'SW': 'London',
  'W': 'London',
  'WC': 'London',
  
  // South East
  'BN': 'South East',
  'BR': 'South East',
  'CR': 'South East',
  'CT': 'South East',
  'DA': 'South East',
  'GU': 'South East',
  'HA': 'South East',
  'HP': 'South East',
  'KT': 'South East',
  'ME': 'South East',
  'OX': 'South East',
  'PO': 'South East',
  'RG': 'South East',
  'RH': 'South East',
  'SL': 'South East',
  'SM': 'South East',
  'SO': 'South East',
  'TN': 'South East',
  'TW': 'South East',
  'UB': 'South East',
  'WD': 'South East',
  
  // South West
  'BA': 'South West',
  'BH': 'South West',
  'BS': 'South West',
  'DT': 'South West',
  'EX': 'South West',
  'GL': 'South West',
  'PL': 'South West',
  'SN': 'South West',
  'SP': 'South West',
  'TA': 'South West',
  'TQ': 'South West',
  'TR': 'South West',
  
  // East of England
  'AL': 'East of England',
  'CB': 'East of England',
  'CM': 'East of England',
  'CO': 'East of England',
  'EN': 'East of England',
  'IG': 'East of England',
  'IP': 'East of England',
  'LU': 'East of England',
  'NR': 'East of England',
  'PE': 'East of England',
  'RM': 'East of England',
  'SG': 'East of England',
  'SS': 'East of England',
  
  // West Midlands
  'B': 'West Midlands',
  'CV': 'West Midlands',
  'DY': 'West Midlands',
  'HR': 'West Midlands',
  'ST': 'West Midlands',
  'WS': 'West Midlands',
  'WV': 'West Midlands',
  
  // East Midlands
  'DE': 'East Midlands',
  'LE': 'East Midlands',
  'NG': 'East Midlands',
  'NN': 'East Midlands',
  'S': 'East Midlands',
  
  // Yorkshire and the Humber
  'BD': 'Yorkshire and the Humber',
  'DN': 'Yorkshire and the Humber',
  'HD': 'Yorkshire and the Humber',
  'HG': 'Yorkshire and the Humber',
  'HU': 'Yorkshire and the Humber',
  'HX': 'Yorkshire and the Humber',
  'LS': 'Yorkshire and the Humber',
  'WF': 'Yorkshire and the Humber',
  'YO': 'Yorkshire and the Humber',
  
  // North West
  'BB': 'North West',
  'BL': 'North West',
  'CA': 'North West',
  'CH': 'North West',
  'CW': 'North West',
  'FY': 'North West',
  'L': 'North West',
  'LA': 'North West',
  'M': 'North West',
  'OL': 'North West',
  'PR': 'North West',
  'SK': 'North West',
  'WA': 'North West',
  'WN': 'North West',
  
  // North East
  'DH': 'North East',
  'DL': 'North East',
  'NE': 'North East',
  'SR': 'North East',
  'TS': 'North East',
  
  // Scotland
  'AB': 'Scotland',
  'DD': 'Scotland',
  'DG': 'Scotland',
  'EH': 'Scotland',
  'FK': 'Scotland',
  'G': 'Scotland',
  'HS': 'Scotland',
  'IV': 'Scotland',
  'KA': 'Scotland',
  'KW': 'Scotland',
  'KY': 'Scotland',
  'ML': 'Scotland',
  'PA': 'Scotland',
  'PH': 'Scotland',
  'TD': 'Scotland',
  'ZE': 'Scotland',
  
  // Wales
  'CF': 'Wales',
  'LD': 'Wales',
  'LL': 'Wales',
  'NP': 'Wales',
  'SA': 'Wales',
  'SY': 'Wales',
  
  // Northern Ireland
  'BT': 'Northern Ireland',
};

// Extract postcode area (first part before space)
export function extractPostcodeArea(postcode: string): string {
  if (!postcode) return '';
  
  // Remove spaces and convert to uppercase
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Extract area code (1-2 letters followed by numbers)
  const match = cleaned.match(/^([A-Z]{1,2})/);
  return match ? match[1] : '';
}

// Get region from postcode
export function getPostcodeRegion(postcode: string): string | null {
  const area = extractPostcodeArea(postcode);
  if (!area) return null;
  
  return POSTCODE_REGIONS[area] || null;
}

// Check if two postcodes are in the same region
export function arePostcodesInSameRegion(postcode1: string, postcode2: string): boolean {
  const region1 = getPostcodeRegion(postcode1);
  const region2 = getPostcodeRegion(postcode2);
  
  if (!region1 || !region2) return false;
  
  return region1 === region2;
}

// Normalize for comparison (strip spaces, uppercase)
function normalizeForCompare(postcode: string): string {
  if (!postcode) return '';
  return postcode.trim().toUpperCase().replace(/\s+/g, '');
}

// Calculate proximity score between two postcodes (0-100)
// Higher score = closer proximity
// Supports UK postcodes (letter-prefix regions) and fallback for numeric/same postcode (e.g. 75210, US or same-area)
export function calculatePostcodeProximity(postcode1: string, postcode2: string): number {
  const n1 = normalizeForCompare(postcode1);
  const n2 = normalizeForCompare(postcode2);
  if (!n1 || !n2) return 0;

  // Exact match (same postcode) = 100 – works for UK and non-UK (e.g. 75210 vs 75210)
  if (n1 === n2) return 100;

  const area1 = extractPostcodeArea(postcode1);
  const area2 = extractPostcodeArea(postcode2);

  // UK postcode logic (starts with 1–2 letters)
  if (area1 && area2) {
    // Same area = 100 (already handled by n1===n2 for same full code)
    if (area1 === area2) return 100;
    // Same region = 75
    if (arePostcodesInSameRegion(postcode1, postcode2)) return 75;
    const region1 = getPostcodeRegion(postcode1);
    const region2 = getPostcodeRegion(postcode2);
    if (!region1 || !region2) return 25;
    const adjacentRegions: Record<string, string[]> = {
      'London': ['South East', 'East of England'],
      'South East': ['London', 'South West', 'East of England'],
      'South West': ['South East', 'West Midlands'],
      'East of England': ['London', 'South East', 'East Midlands'],
      'West Midlands': ['South West', 'East Midlands', 'Wales'],
      'East Midlands': ['East of England', 'West Midlands', 'Yorkshire and the Humber'],
      'Yorkshire and the Humber': ['East Midlands', 'North West', 'North East'],
      'North West': ['Yorkshire and the Humber', 'North East'],
      'North East': ['Yorkshire and the Humber', 'North West'],
    };
    if (adjacentRegions[region1]?.includes(region2)) return 50;
    return 25;
  }

  // Non-UK / numeric postcodes (e.g. US 75210): use prefix matching so same or nearby codes match
  const minLen = Math.min(n1.length, n2.length);
  if (minLen >= 5 && n1.slice(0, 5) === n2.slice(0, 5)) return 100;
  if (minLen >= 4 && n1.slice(0, 4) === n2.slice(0, 4)) return 75;
  if (minLen >= 3 && n1.slice(0, 3) === n2.slice(0, 3)) return 50;
  if (minLen >= 2 && n1.slice(0, 2) === n2.slice(0, 2)) return 25;
  return 0;
}

// Check if postcode is within a certain distance threshold
export function isPostcodeWithinRange(
  postcode1: string,
  postcode2: string,
  minProximityScore: number = 50
): boolean {
  return calculatePostcodeProximity(postcode1, postcode2) >= minProximityScore;
}

// Get all postcodes in the same region
export function getPostcodesInSameRegion(postcode: string, postcodeList: string[]): string[] {
  const region = getPostcodeRegion(postcode);
  if (!region) return [];
  
  return postcodeList.filter(pc => getPostcodeRegion(pc) === region);
}

// Normalize postcode format (uppercase, add space if needed)
export function normalizePostcode(postcode: string): string {
  if (!postcode) return '';
  
  // Remove all spaces and convert to uppercase
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Add space before last 3 characters if not already present
  if (cleaned.length > 3) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}
