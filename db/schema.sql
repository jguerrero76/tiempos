CREATE TABLE IF NOT EXISTS estimation_cache (
  stop_id TEXT NOT NULL,
  line TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (stop_id, line)
);
