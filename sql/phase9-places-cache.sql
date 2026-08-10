-- Phase 9: Google Places API cache.
--
-- Caches Place details results keyed by (place_id, trade_slug) so
-- repeated requests for the same place × trade combination are served
-- from the database rather than re-calling Google.
--
-- Google Places API v1 caching policy:
--   - Place IDs: no expiry (cached indefinitely)
--   - All other fields: max 30 days
-- We set expires_at to fetched_at + 30 days and a cron job purges
-- rows past that window, per Google ToS.

CREATE TABLE IF NOT EXISTS places_cache (
  place_id      TEXT NOT NULL,
  trade_slug    TEXT NOT NULL,
  location_slug TEXT NOT NULL,
  data          JSONB NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),

  PRIMARY KEY (place_id, trade_slug)
);

-- Speed up the purge cron (DELETE WHERE expires_at < now())
CREATE INDEX IF NOT EXISTS idx_places_cache_expires_at
  ON places_cache (expires_at)
  WHERE expires_at IS NOT NULL;
