-- ============================================================
-- HeartSync: Unsync / Breakup Feature — SQL Migration
-- Run this in Supabase SQL Editor → New Query
-- ============================================================


-- ============================================================
-- SECTION 1: Add breakup audit columns to profiles table
-- These track WHEN and WHY the last unsync happened.
-- Useful for preventing abuse (re-sync spam) in the future.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_unsynced_at  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS unsync_count      INTEGER     DEFAULT 0;


-- ============================================================
-- SECTION 2: Secure RLS policy on profiles table
-- Users should only be able to UPDATE their own profile row.
-- Without this, the unsync operation (which writes partner_id
-- = NULL) could theoretically be called against anyone's row.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old blanket policies if they exist (idempotent)
DROP POLICY IF EXISTS "Allow all for authenticated"      ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"     ON profiles;
DROP POLICY IF EXISTS "Users can read own profile"       ON profiles;
DROP POLICY IF EXISTS "Users can read partner profile"   ON profiles;

-- A user can only read their own row OR their partner's row
CREATE POLICY "Users can read own and partner profile"
ON profiles
FOR SELECT
USING (
  id = auth.uid()
  OR
  id = (
    SELECT partner_id
    FROM   profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- A user can only UPDATE their own row (not their partner's)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING  (id = auth.uid())
WITH CHECK (id = auth.uid());

-- A user can insert only their own profile row (sign-up flow)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;


-- ============================================================
-- SECTION 3: Update connections table when unsync happens
-- When both profile rows are cleared, also mark the
-- connections record as 'ended' for audit history.
-- ============================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can update own connection" ON connections;

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own connection"
ON connections
FOR UPDATE
USING (user_a_id = auth.uid() OR user_b_id = auth.uid())
WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Users can read own connection"
ON connections
FOR SELECT
USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

GRANT SELECT, UPDATE ON connections TO authenticated;


-- ============================================================
-- VERIFY: Check all policies are in place
-- SELECT tablename, policyname, cmd
-- FROM   pg_policies
-- WHERE  tablename IN ('profiles', 'connections');
-- ============================================================