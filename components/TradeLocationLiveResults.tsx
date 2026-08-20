import { getSupabaseAdmin } from "@/lib/supabase";
import {
  Shield,
  CheckCircle,
  Phone,
  Globe,
  MapPin,
  Info,
} from "lucide-react";

interface Props {
  tradeSlug: string;
  tradeName: string;
  tradePlural: string;
  locationSlug: string;
  locationName: string;
}

interface Member {
  id: string;
  name: string;
  city: string | null;
  postcode: string | null;
  phone: string | null;
  is_verified: boolean;
  hourly_rate: number | null;
  years_experience: number | null;
}

interface Prospect {
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default async function TradeLocationLiveResults({
  tradeSlug,
  tradeName,
  tradePlural,
  locationSlug,
  locationName,
}: Props) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Group 1: MyApproved members (vetted tradespeople).
  // Match members by their humanized trade name (e.g. "Plumber"), falling back
  // to a slug-ish comparison is unreliable since `trade` is not slugged in the
  // members table — so we query by the humanized trade name AND the singular
  // name, then filter by city match in JS.
  const memberQuery = supabase
    .from("tradespeople")
    .select(
      "id, first_name, last_name, trade, city, postcode, phone, is_verified, hourly_rate, years_experience, profile_picture_url",
    )
    .eq("is_active", true)
    .eq("is_approved", true)
    .in("trade", [tradeName, tradeName.toLowerCase(), tradeName.toUpperCase()]);

  // Group 2: harvested businesses from the offline outreach_prospects cache.
  // `trade_slug` is lowercased; `location` stores the humanized string passed
  // into the harvest script (as well as possible slug forms).
  const locationForms = Array.from(
    new Set(
      [locationName, locationSlug, slugify(locationName)].filter(Boolean),
    ),
  );

  const [memberRes, prospectRes] = await Promise.all([
    memberQuery,
    supabase
      .from("outreach_prospects")
      .select("place_id, name, address, phone, website")
      .eq("trade_slug", tradeSlug.toLowerCase())
      .in("location", locationForms)
      .limit(50),
  ]);

  if (memberRes.error || prospectRes.error) {
    console.warn(
      "TradeLocationLiveResults query error:",
      memberRes.error?.message,
      prospectRes.error?.message,
    );
  }

  const prospects: Prospect[] = (prospectRes.data ?? []).filter(
    (p: Prospect) => p.name && p.name.trim(),
  );

  const locationMatch = locationName.toLowerCase();
  const members: Member[] = ((memberRes.data ?? []) as any[]).filter(
    (row: any) => {
      const city = (row.city || "").toLowerCase();
      const postcode = (row.postcode || "").toLowerCase();
      const matchesCity =
        !!city &&
        (city === locationMatch ||
          city.includes(locationMatch) ||
          locationMatch.includes(city));
      const matchesPostcode =
        !!postcode &&
        locationMatch &&
        (postcode.includes(locationMatch) ||
          locationMatch.includes(postcode));
      return matchesCity || matchesPostcode;
    },
  );

  if (members.length === 0 && prospects.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Group 1: MyApproved members ── */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#002FA7] mb-2">
          MyApproved {tradePlural} in {locationName}
        </h2>

        {members.length === 0 ? (
          <p className="text-sm text-gray-500 mb-8">
            There are currently no MyApproved {tradePlural.toLowerCase()} listed
            in {locationName}. The businesses below are listed on Google and
            have not been vetted by MyApproved.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex-1 font-bold text-[#002FA7] truncate">
                    {m.name}
                  </span>
                  {m.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {[m.city, m.postcode].filter(Boolean).length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[m.city, m.postcode].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {m.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {m.phone}
                    </div>
                  )}
                  {m.hourly_rate ? (
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-gray-400" />
                      £{m.hourly_rate}/hr
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Group 2: Harvested businesses ── */}
        {prospects.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Other businesses in {locationName}
            </h3>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              These businesses have not been vetted by MyApproved.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prospects.map((p) => (
                <div
                  key={p.place_id}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="font-semibold text-gray-800 truncate mb-1">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Listed on Google. Not a MyApproved member.
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {p.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {p.address}
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {p.phone}
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {p.website}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
