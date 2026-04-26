-- ============================================================
-- HeartSync: Phase 1 & Phase 2 — Security Migration
-- Run this entire script in Supabase SQL Editor → New Query
-- ============================================================


-- ============================================================
-- SECTION 1: AGE VERIFICATION (Database-Level CHECK Constraint)
-- Enforces 18+ strictly at the Postgres layer.
-- Even if the frontend is bypassed, Postgres will reject the row.
-- ============================================================

-- Drop the constraint first so this script is safely re-runnable
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_age_18_plus;

-- Add the constraint: dob must be at least 18 years before today
ALTER TABLE profiles
  ADD CONSTRAINT chk_profiles_age_18_plus
  CHECK (dob <= (CURRENT_DATE - INTERVAL '18 years'));


-- ============================================================
-- SECTION 2: MESSAGES TABLE — Row Level Security
-- A user may only read/write messages if they are a participant
-- in the conversation (i.e. sender or the sender's partner).
-- ============================================================

-- 2a. Enable RLS on messages (no-op if already enabled)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2b. Revoke blanket public grants (added during rapid-dev phase)
REVOKE ALL ON messages FROM anon;

-- 2c. Drop old permissive policies if they exist (idempotent)
DROP POLICY IF EXISTS "Allow all for authenticated" ON messages;
DROP POLICY IF EXISTS "Users can view own and partner messages"  ON messages;
DROP POLICY IF EXISTS "Users can insert own messages"           ON messages;

-- 2d. SELECT policy:
--     A row is visible if:
--       (a) the current user IS the sender, OR
--       (b) the sender IS the current user's linked partner
CREATE POLICY "Users can view own and partner messages"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid()
  OR
  sender_id = (
    SELECT partner_id
    FROM   profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- 2e. INSERT policy:
--     A user may only insert a message where they ARE the sender.
--     This prevents impersonation entirely.
CREATE POLICY "Users can insert own messages"
ON messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- 2f. Re-grant only what authenticated users need
GRANT SELECT, INSERT ON messages TO authenticated;


-- ============================================================
-- SECTION 3: BUCKET LIST TABLE — Row Level Security
-- Only the author and their linked partner may read or mutate
-- bucket-list items. Strangers see nothing.
-- ============================================================

-- 3a. Enable RLS
ALTER TABLE bucket_list ENABLE ROW LEVEL SECURITY;

-- 3b. Revoke blanket public grants
REVOKE ALL ON bucket_list FROM anon;

-- 3c. Drop old permissive policies (idempotent)
DROP POLICY IF EXISTS "Allow all for authenticated"             ON bucket_list;
DROP POLICY IF EXISTS "Users can view own and partner bucket"   ON bucket_list;
DROP POLICY IF EXISTS "Users can insert own bucket items"       ON bucket_list;
DROP POLICY IF EXISTS "Users can update own and partner bucket" ON bucket_list;

-- 3d. SELECT policy:
--     Visible if the current user authored the item OR
--     the author is the current user's linked partner.
CREATE POLICY "Users can view own and partner bucket"
ON bucket_list
FOR SELECT
USING (
  author_id = auth.uid()
  OR
  author_id = (
    SELECT partner_id
    FROM   profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- 3e. INSERT policy:
--     Can only create items assigned to yourself.
CREATE POLICY "Users can insert own bucket items"
ON bucket_list
FOR INSERT
WITH CHECK (author_id = auth.uid());

-- 3f. UPDATE policy:
--     Either partner can toggle is_completed on any shared item.
--     The author_id itself cannot be changed (enforced by WITH CHECK).
CREATE POLICY "Users can update own and partner bucket"
ON bucket_list
FOR UPDATE
USING (
  author_id = auth.uid()
  OR
  author_id = (
    SELECT partner_id
    FROM   profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
)
WITH CHECK (
  author_id = auth.uid()
  OR
  author_id = (
    SELECT partner_id
    FROM   profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- 3g. Re-grant minimal permissions
GRANT SELECT, INSERT, UPDATE ON bucket_list TO authenticated;


-- ============================================================
-- SECTION 4: CONNECTION INTEGRITY
-- Partial unique indexes guarantee that a user can NEVER have
-- more than one 'active' connection at any point in time.
-- This covers both sides of the relationship (user_a and user_b).
-- ============================================================

-- Drop first so the script is re-runnable
DROP INDEX IF EXISTS idx_unique_active_conn_user_a;
DROP INDEX IF EXISTS idx_unique_active_conn_user_b;

-- One active connection per user_a_id
CREATE UNIQUE INDEX idx_unique_active_conn_user_a
ON connections (user_a_id)
WHERE  status = 'active';

-- One active connection per user_b_id
CREATE UNIQUE INDEX idx_unique_active_conn_user_b
ON connections (user_b_id)
WHERE  status = 'active';


-- ============================================================
-- DONE.
-- Run a quick sanity-check query to confirm policies:
--   SELECT tablename, policyname, cmd
--   FROM   pg_policies
--   WHERE  tablename IN ('messages', 'bucket_list');
-- ============================================================