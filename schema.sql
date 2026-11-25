CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL CHECK (level IN ('primary','secondary','tertiary','specialist')),
  lga text,
  state text NOT NULL DEFAULT 'Oyo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('referrer','receiving','admin')),
  facility_id uuid REFERENCES facilities(id),
  token_version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id text NOT NULL UNIQUE,
  ref_number text UNIQUE,
  created_by uuid NOT NULL REFERENCES users(id),
  from_facility_id uuid NOT NULL REFERENCES facilities(id),
  to_facility_id uuid NOT NULL REFERENCES facilities(id),
  patient_initials text NOT NULL,
  patient_age integer,
  patient_sex text CHECK (patient_sex IN ('M','F')),
  severity text NOT NULL CHECK (severity IN ('CRITICAL','URGENT','ROUTINE')),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','DELIVERED','SEEN','ACCEPTED','TRANSFERRED','DECLINED')),
  clinical_summary text NOT NULL,
  vitals jsonb NOT NULL DEFAULT '{}'::jsonb,
  bed_assignment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  accepted_at timestamptz,
  transferred_at timestamptz
);

CREATE TABLE IF NOT EXISTS referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  status text NOT NULL,
  actor_id uuid REFERENCES users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_status_idx ON referrals (status, created_at DESC);
CREATE INDEX IF NOT EXISTS events_referral_idx ON referral_events (referral_id, created_at);
CREATE INDEX IF NOT EXISTS messages_referral_idx ON referral_messages (referral_id, created_at);
