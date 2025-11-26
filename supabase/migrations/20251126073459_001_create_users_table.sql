/*
  # Core User and Authentication Tables

  1. New Tables
    - `users` - Extended user profiles
      - Basic user info, stats, and settings
    - `user_profiles` - Extended profile details
      - Personal information like DOB, address, etc
    - `privacy_settings` - User privacy preferences
    - `social_links` - User social media links

  2. Security
    - Enable RLS on all tables
    - Public can read user profiles
    - Users can only update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  handle text UNIQUE NOT NULL,
  avatar text,
  bio text,
  email text UNIQUE NOT NULL,
  phone_number text,
  verified boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_active timestamptz DEFAULT now(),
  subscriber_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  is_private_mode boolean DEFAULT false,
  is_profile_complete boolean DEFAULT false,
  theme_preference text DEFAULT 'light',
  website text,
  location text,
  joined_date timestamptz DEFAULT now(),
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  date_of_birth date,
  age integer,
  country_code text,
  pincode text,
  address text,
  optional_phone text,
  status_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_privacy text DEFAULT 'private',
  phone_privacy text DEFAULT 'private',
  dob_privacy text DEFAULT 'contacts',
  address_privacy text DEFAULT 'private',
  last_active_privacy text DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any public user profile"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read any user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile details"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read privacy settings of connected users"
  ON privacy_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
  ON privacy_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
  ON privacy_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read any social links"
  ON social_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_users_handle ON users(handle);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_social_links_user_id ON social_links(user_id);
