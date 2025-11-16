-- Fix critical security issues

-- 1. Fix messaging system - add INSERT policies for conversations and conversation_participants
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Add input validation constraints
ALTER TABLE public.posts
ADD CONSTRAINT posts_caption_length CHECK (length(caption) <= 2000);

ALTER TABLE public.comments
ADD CONSTRAINT comments_content_length CHECK (length(content) <= 1000);

ALTER TABLE public.messages
ADD CONSTRAINT messages_content_length CHECK (length(content) <= 5000);

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_bio_length CHECK (length(bio) <= 500),
ADD CONSTRAINT profiles_username_length CHECK (length(username) >= 3 AND length(username) <= 30),
ADD CONSTRAINT profiles_full_name_length CHECK (length(full_name) <= 100);

ALTER TABLE public.sent_files
ADD CONSTRAINT sent_files_name_length CHECK (length(file_name) <= 255);

-- 3. Add notification deletion policy
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix function search paths (already done in previous migration but ensuring they're set)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, content, related_id, actor_id)
  SELECT 
    p.user_id,
    'like',
    (SELECT username FROM public.profiles WHERE id = NEW.user_id) || ' liked your post',
    NEW.post_id,
    NEW.user_id
  FROM public.posts p
  WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, content, related_id, actor_id)
  SELECT 
    p.user_id,
    'comment',
    (SELECT username FROM public.profiles WHERE id = NEW.user_id) || ' commented on your post',
    NEW.post_id,
    NEW.user_id
  FROM public.posts p
  WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, content, related_id, actor_id)
  VALUES (
    NEW.following_id,
    'follow',
    (SELECT username FROM public.profiles WHERE id = NEW.follower_id) || ' started following you',
    NEW.id,
    NEW.follower_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;