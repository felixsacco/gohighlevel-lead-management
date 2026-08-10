import { MapPin, Phone, Globe, Navigation } from "lucide-react";
import { fetchPlaces, type GooglePlace } from "@/lib/places/fetch-places";

interface Props {
  tradeSlug: string;
  tradeName: string;
  tradePlural: string;
  locationSlug: string;
  locationName: string;
}

function PlaceCard({ place }: { place: GooglePlace }) {
  const name = place.displayName?.text ?? "Business";
  const rating = place.rating;
  const reviewCount = place.userRatingCount;
  const address = place.shortFormattedAddress;
  const isOpen = place.regularOpeningHours?.openNow;
  const phone = place.internationalPhoneNumber;
  const website = place.websiteUri;
  const summary = place.editorialSummary?.text;
  const filledStars = rating ? Math.round(rating) : 0;
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const directionsUrl =
    lat && lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="text-[15px] font-bold text-[#0f172a] leading-snug mb-1 pr-2" translate="no">
        {name}
      </h3>

      <div className="flex items-center flex-wrap gap-1 text-sm mb-1">
        {rating != null && (
          <>
            <span className="font-semibold text-gray-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-yellow-400 text-xs tracking-tight">
              {"★".repeat(filledStars)}
              {"☆".repeat(Math.max(0, 5 - filledStars))}
            </span>
            {reviewCount != null && (
              <span className="text-gray-500 text-xs">
                ({reviewCount.toLocaleString()})
              </span>
            )}
          </>
        )}
        {place.primaryTypeDisplayName?.text && (
          <>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {place.primaryTypeDisplayName.text}
            </span>
          </>
        )}
      </div>

      {address && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span>{address}</span>
        </div>
      )}

      <div className="flex items-center flex-wrap gap-1 text-xs mb-3">
        {isOpen != null && (
          <span
            className={
              isOpen ? "font-semibold text-green-600" : "text-gray-500"
            }
          >
            {isOpen ? "Open now" : "Closed"}
          </span>
        )}
        {phone && (
          <>
            {isOpen != null && <span className="text-gray-300">·</span>}
            <span className="text-gray-500">{phone}</span>
          </>
        )}
      </div>

      {summary && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
          {summary}
        </p>
      )}

      <div className="h-px bg-gray-100 mb-3" />

      <div className="grid grid-cols-3 gap-1.5">
        <a
          href={phone ? `tel:${phone.replace(/\s/g, "")}` : undefined}
          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#fdbd18] text-[#0f172a] text-[11px] font-semibold hover:brightness-95 transition-all ${
            !phone ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          Call
        </a>
        <a
          href={website ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors ${
            !website ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Website
        </a>
        <a
          href={directionsUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-[#002FA7] text-white text-[11px] font-semibold hover:bg-[#001f7a] transition-colors ${
            !directionsUrl ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </a>
      </div>
    </div>
  );
}

export default async function TradeLocationLiveResults({
  tradeSlug,
  tradeName,
  tradePlural,
  locationSlug,
  locationName,
}: Props) {
  const places = await fetchPlaces(
    tradeName,
    locationName,
    tradeSlug,
    locationSlug,
  );

  if (places.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#002FA7]">
          Other local businesses
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          From Google Maps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {places.slice(0, 6).map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <img
          src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png"
          alt="Google"
          className="h-4"
        />
        <span className="text-[11px] text-gray-400">
          Results sourced from Google Maps. Place names, ratings and photos
          are provided by Google and subject to their{" "}
          <a
            href="https://www.google.com/intl/en_GB/help/terms_maps/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            terms
          </a>
          .
        </span>
      </div>
    </section>
  );
}
