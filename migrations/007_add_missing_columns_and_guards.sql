-- 007_add_missing_columns_and_guards.sql
-- Safely add missing columns and indexes referenced by other migrations

-- Ensure payment_status column, constraint, and index exist on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Recreate a safe CHECK constraint for payment_status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (
  payment_status IN ('Pending Verification','Paid','Rejected') OR payment_status IS NULL
);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

-- Ensure username exists on users and create unique index safely
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Create unique index (if index already exists this is a no-op)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- Set NOT NULL on username only when there are no NULLs (safe migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'users'
      AND column_name = 'username'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username IS NULL) THEN
      EXECUTE 'ALTER TABLE users ALTER COLUMN username SET NOT NULL';
    END IF;
  END IF;
END
$$;

-- Optional: ensure idx_users_username exists on pg side (defensive)
-- (already covered by CREATE UNIQUE INDEX IF NOT EXISTS)

-- End of migration
