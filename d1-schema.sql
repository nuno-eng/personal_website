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
