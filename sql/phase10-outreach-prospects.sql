CREATE TABLE IF NOT EXISTS outreach_prospects (
  place_id       TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  trade_slug     TEXT NOT NULL,
  location       TEXT NOT NULL,
  address        TEXT,
  phone          TEXT,
  website        TEXT,
  rating         NUMERIC(2,1),
  review_count   INTEGER,
  ghl_contact_id TEXT,
  synced_at      TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'new',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE outreach_prospects IS 'Tradespeople harvested from Google Places for GHL outreach';
