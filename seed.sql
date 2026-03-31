# manual_seed_data.sql (Paste this into your PostgreSQL client)

-- 1. Create Admin User (Password: Admin@12345678)
-- Argon2id Hash: $argon2id$v=19$m=65536,t=3,p=4$dummy... (Generate a real one for security)
INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'System Admin',
  'admin@football.com',
  '$argon2id$v=19$m=65536,t=3,p=4$SGFzaGVkUGFzc3dvcmQxMjM0NTY3OA$some-real-hash-here',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 2. Create a League
INSERT INTO leagues (id, name, season, created_by, start_date, end_date, status, created_at, updated_at)
VALUES (
  '223e4567-e89b-12d3-a456-426614174001',
  'Premier League',
  '2025',
  '123e4567-e89b-12d3-a456-426614174000',
  '2025-01-01',
  '2025-12-31',
  'active',
  NOW(),
  NOW()
);

-- 3. Create Teams
INSERT INTO teams (id, name, league_id, manager_id, created_at, updated_at)
VALUES (
  '323e4567-e89b-12d3-a456-426614174002',
  'Red Lions FC',
  '223e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  NOW(),
  NOW()
),
(
  '423e4567-e89b-12d3-a456-426614174003',
  'Blue Eagles United',
  '223e4567-e89b-12d3-a456-426614174001',
  '123e4567-e89b-12d3-a456-426614174000',
  NOW(),
  NOW()
);

-- 4. Create Players
INSERT INTO players (id, name, number, position, team_id, created_at, updated_at)
VALUES (
  '523e4567-e89b-12d3-a456-426614174004',
  'David Striker',
  9,
  'FWD',
  '323e4567-e89b-12d3-a456-426614174002',
  NOW(),
  NOW()
),
(
  '623e4567-e89b-12d3-a456-426614174005',
  'John Keeper',
  1,
  'GK',
  '423e4567-e89b-12d3-a456-426614174003',
  NOW(),
  NOW()
);
