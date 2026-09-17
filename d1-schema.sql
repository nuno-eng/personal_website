-- D1 schema for subscribers: referral codes, welcome-sequence email ids,
-- signup source (which page the lead came from) and unsubscribe state.
-- Apply with: npx wrangler d1 execute newsletter-db --file=d1-schema.sql --remote

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT,
  display_name TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  source TEXT,
  ip_hash TEXT,
  day3_email_id TEXT,
  day7_email_id TEXT,
  created_at TEXT NOT NULL,
  unsubscribed_at TEXT,
  link_sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_referred_by ON subscribers(referred_by_code);
CREATE INDEX IF NOT EXISTS idx_subscribers_ip_created ON subscribers(ip_hash, created_at);

-- Free resource requests from /free-resources/ (email delivery).
CREATE TABLE IF NOT EXISTS resource_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  resource TEXT NOT NULL,
  newsletter INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resource_requests_ip_created ON resource_requests(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_requests_email ON resource_requests(email);

-- Discovery call bookings (/book/). Google Calendar holds the event; this
-- table keeps the answers, the manage-link state and scheduled email ids.
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,            -- confirmed | cancelled | failed
  start_utc TEXT NOT NULL,
  end_utc TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  agency TEXT NOT NULL,
  agency_type TEXT,
  team_size TEXT,
  problem TEXT,
  urgency TEXT,
  heard_from TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  tz TEXT,
  source TEXT,
  event_id TEXT,
  meet_link TEXT,
  reminder24_id TEXT,
  reminder1_id TEXT,
  followup_id TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_confirmed_slot ON bookings(start_utc) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS idx_bookings_ip_created ON bookings(ip_hash, created_at);
