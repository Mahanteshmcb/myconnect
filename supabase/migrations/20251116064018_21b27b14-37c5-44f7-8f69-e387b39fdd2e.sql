-- Fix critical security issues

-- 1. Fix messaging system - add INSERT policies for conversations and conversation_participants
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Add input validation constraints (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'posts_caption_length'
  ) THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_caption_length CHECK (length(caption) <= 2000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'comments_content_length'
  ) THEN
    ALTER TABLE public.comments ADD CONSTRAINT comments_content_length CHECK (length(content) <= 1000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'messages_content_length'
  ) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_content_length CHECK (length(content) <= 5000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'profiles_bio_length'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (length(bio) <= 500);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'profiles_username_length'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_length CHECK (length(username) >= 3 AND length(username) <= 30);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'profiles_full_name_length'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_full_name_length CHECK (length(full_name) <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'sent_files_name_length'
  ) THEN
    ALTER TABLE public.sent_files ADD CONSTRAINT sent_files_name_length CHECK (length(file_name) <= 255);
  END IF;
END $$;

-- 3. Add notification deletion policy
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);