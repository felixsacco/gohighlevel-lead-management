const BASE_URL = 'https://api.company-information.service.gov.uk';

interface CompaniesHouseSearchResult {
  company_number: string;
  title: string;
  company_status: string;
  company_type: string;
  address: {
    address_line_1: string;
    address_line_2?: string;
    locality: string;
    postal_code: string;
    country: string;
  };
  date_of_creation: string;
}

interface CompaniesHouseProfile {
  company_number: string;
  company_name: string;
  company_status: string;
  type: string;
  registered_office_address: {
    address_line_1: string;
    address_line_2?: string;
    locality: string;
    postal_code: string;
    country: string;
  };
  date_of_creation: string;
  sic_codes: string[];
  jurisdiction: string;
}

export interface VerifiedCompany {
  companyNumber: string;
  companyName: string;
  status: string;
  type: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    postalCode: string;
    country: string;
  };
  dateOfCreation: string;
  sicCodes: string[];
  jurisdiction: string;
}

export async function searchCompanies(query: string, limit = 5): Promise<VerifiedCompany[]> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    console.warn('COMPANIES_HOUSE_API_KEY not set — skipping Companies House search');
    return [];
  }

  const url = `${BASE_URL}/search/companies?q=${encodeURIComponent(query)}&items_per_page=${limit}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
  });

  if (!res.ok) {
    console.error('Companies House search error:', res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return (data.items || []).map((item: CompaniesHouseSearchResult) => ({
    companyNumber: item.company_number,
    companyName: item.title,
    status: item.company_status,
    type: item.company_type,
    address: {
      line1: item.address.address_line_1,
      line2: item.address.address_line_2,
      locality: item.address.locality,
      postalCode: item.address.postal_code,
      country: item.address.country,
    },
    dateOfCreation: item.date_of_creation,
    sicCodes: [],
    jurisdiction: '',
  }));
}

export async function getCompanyProfile(companyNumber: string): Promise<VerifiedCompany | null> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    console.warn('COMPANIES_HOUSE_API_KEY not set — skipping Companies House lookup');
    return null;
  }

  // Strip any non-alphanumeric chars for safety
  const clean = companyNumber.replace(/[^A-Za-z0-9]/g, '');
  const url = `${BASE_URL}/company/${encodeURIComponent(clean)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error('Companies House profile error:', res.status, res.statusText);
    return null;
  }

  const profile: CompaniesHouseProfile = await res.json();

  return {
    companyNumber: profile.company_number,
    companyName: profile.company_name,
    status: profile.company_status,
    type: profile.type,
    address: {
      line1: profile.registered_office_address.address_line_1,
      line2: profile.registered_office_address.address_line_2,
      locality: profile.registered_office_address.locality,
      postalCode: profile.registered_office_address.postal_code,
      country: profile.registered_office_address.country,
    },
    dateOfCreation: profile.date_of_creation,
    sicCodes: profile.sic_codes || [],
    jurisdiction: profile.jurisdiction,
  };
}
