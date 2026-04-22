-- Add settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS private_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS like_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS follow_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS comment_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
