-- 003: Reconstrói o enum user_role com o vocabulário canônico.
-- O banco legado tinha ('user','shopkeeper','neighborhood_admin','global_admin');
-- o canônico é ('user','store_owner','driver','admin','superadmin').
-- Idempotente: só age se o label 'superadmin' ainda não existir no enum.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'superadmin'
    ) THEN
        ALTER TYPE user_role RENAME TO legacy_v1_user_role;
        CREATE TYPE user_role AS ENUM ('user', 'store_owner', 'driver', 'admin', 'superadmin');

        ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING (
            CASE role::text
                WHEN 'shopkeeper' THEN 'store_owner'
                WHEN 'neighborhood_admin' THEN 'admin'
                WHEN 'global_admin' THEN 'superadmin'
                WHEN 'store_owner' THEN 'store_owner'
                WHEN 'driver' THEN 'driver'
                WHEN 'admin' THEN 'admin'
                WHEN 'superadmin' THEN 'superadmin'
                ELSE 'user'
            END
        )::user_role;
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

        DROP TYPE legacy_v1_user_role;
    END IF;
END $$;
