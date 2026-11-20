-- ==============================================================================
-- SEED / FIRST ADMIN CREATION INSTRUCTIONS
-- ==============================================================================

-- Method 1: Elevate an existing user to Admin
-- 1. Sign up through Supabase Auth Dashboard or API with your desired admin email.
-- 2. Run the query below in Supabase SQL Editor:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@company.com';

-- ------------------------------------------------------------------------------
-- Method 2: Create First Admin Directly with SQL (if pgcrypto extension enabled)
-- ------------------------------------------------------------------------------
-- DO $$
-- DECLARE
--   new_user_id UUID := gen_random_uuid();
-- BEGIN
--   INSERT INTO auth.users (
--     id,
--     instance_id,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     raw_app_meta_data,
--     raw_user_meta_data,
--     created_at,
--     updated_at,
--     role
--   ) VALUES (
--     new_user_id,
--     '00000000-0000-0000-0000-000000000000',
--     'admin@company.com',
--     crypt('AdminPassword123!', gen_salt('bf')),
--     now(),
--     '{"provider":"email","providers":["email"]}',
--     '{"full_name":"System Administrator","role":"admin"}',
--     now(),
--     now(),
--     'authenticated'
--   );
-- END $$;
