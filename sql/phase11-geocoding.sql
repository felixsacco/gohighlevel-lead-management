-- Phase 11: Geocoding
-- Adds lat/lng columns to jobs + tradespeople, a postcode_cache table,
-- and a haversine helper for earth-distance calculations.
-- Run in Supabase SQL editor.

-- 1. Enable extensions (earthdistance pulls in cube automatically)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- 2. Add lat/lng columns
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude numeric;

ALTER TABLE tradespeople ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE tradespeople ADD COLUMN IF NOT EXISTS longitude numeric;

-- 3. postcode cache — keyed on normalised postcode
CREATE TABLE IF NOT EXISTS postcode_cache (
  postcode   text PRIMARY KEY,
  latitude   numeric NOT NULL,
  longitude  numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE postcode_cache IS 'Cached geocoding results from postcodes.io';

-- 4. Haversine helper (fallback when earthdistance is not available)
--    Returns distance in metres between two lat/lng points.
CREATE OR REPLACE FUNCTION haversine_distance(
  lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric
) RETURNS numeric AS $$
  SELECT 6371000 * 2 * asin(
    sqrt(
      pow(sin(radians($3 - $1) / 2), 2) +
      cos(radians($1)) * cos(radians($3)) *
      pow(sin(radians($4 - $2) / 2), 2)
    )
  );
$$ LANGUAGE sql IMMUTABLE;
