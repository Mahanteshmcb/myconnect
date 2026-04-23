-- ====================================================================
-- COMPLETE MYCONNECT DATABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor and run once
-- ====================================================================

-- SECTION 1: Initial Schema (Profiles, Posts, Follows, Likes, Comments)
-- ====================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  caption text,
  image_url text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.posts enable row level security;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
create policy "Users can create own posts"
  on public.posts for insert with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id);

create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

alter table public.follows enable row level security;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, post_id)
);

alter table public.likes enable row level security;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

DROP POLICY IF EXISTS "Users can like posts" ON public.likes;
create policy "Users can like posts"
  on public.likes for insert with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON public.likes;
create policy "Users can unlike posts"
  on public.likes for delete using (auth.uid() = user_id);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.comments enable row level security;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
create policy "Users can create comments"
  on public.comments for insert with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- Storage buckets for avatars and posts
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true) on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('posts', 'posts', true) on conflict do nothing;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Post images are publicly accessible" ON storage.objects;
create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'posts');

DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
create policy "Users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'posts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Functions and triggers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- SECTION 2: User Roles, Conversations & Messages
-- ====================================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sent_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.sent_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conversations & Messages
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can add conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can add conversation participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversation_participants.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

-- Notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Story policies
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (expires_at > now());
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
CREATE POLICY "Users can create their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view story views" ON public.story_views;
CREATE POLICY "Users can view story views" ON public.story_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stories WHERE id = story_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can record story views" ON public.story_views;
CREATE POLICY "Users can record story views" ON public.story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Sent files policies
DROP POLICY IF EXISTS "Users can view files they sent or received" ON public.sent_files;
CREATE POLICY "Users can view files they sent or received" ON public.sent_files FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send files" ON public.sent_files;
CREATE POLICY "Users can send files" ON public.sent_files FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Receivers can update opened status" ON public.sent_files;
CREATE POLICY "Receivers can update opened status" ON public.sent_files FOR UPDATE USING (auth.uid() = receiver_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-files', 'shared-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('message-files', 'message-files', false) ON CONFLICT DO NOTHING;

-- Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = (SELECT oid FROM pg_class WHERE relname = 'messages' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = (SELECT oid FROM pg_class WHERE relname = 'notifications' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_rel WHERE prpubid = (SELECT oid FROM pg_publication WHERE pubname = 'supabase_realtime') AND prrelid = (SELECT oid FROM pg_class WHERE relname = 'sent_files' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sent_files;
  END IF;
END $$;

-- SECTION 3: Videos, Hashtags & Search
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;
CREATE POLICY "Videos are viewable by everyone" ON public.videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can upload their own videos" ON public.videos;
CREATE POLICY "Users can upload their own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
CREATE POLICY "Users can delete their own videos" ON public.videos FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
CREATE POLICY "Users can update their own videos" ON public.videos FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Video likes are viewable by everyone" ON public.video_likes;
CREATE POLICY "Video likes are viewable by everyone" ON public.video_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like videos" ON public.video_likes;
CREATE POLICY "Users can like videos" ON public.video_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike videos" ON public.video_likes;
CREATE POLICY "Users can unlike videos" ON public.video_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Video comments are viewable by everyone" ON public.video_comments;
CREATE POLICY "Video comments are viewable by everyone" ON public.video_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create video comments" ON public.video_comments;
CREATE POLICY "Users can create video comments" ON public.video_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own video comments" ON public.video_comments;
CREATE POLICY "Users can delete own video comments" ON public.video_comments FOR DELETE USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
CREATE POLICY "Anyone can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
CREATE POLICY "Users can upload videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE USING (
  bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hashtags are viewable by everyone" ON public.hashtags;
CREATE POLICY "Hashtags are viewable by everyone" ON public.hashtags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create hashtags" ON public.hashtags;
CREATE POLICY "Authenticated users can create hashtags" ON public.hashtags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update hashtags" ON public.hashtags;
CREATE POLICY "Authenticated users can update hashtags" ON public.hashtags FOR UPDATE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((post_id IS NOT NULL AND video_id IS NULL) OR (post_id IS NULL AND video_id IS NOT NULL))
);

ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Post hashtags are viewable by everyone" ON public.post_hashtags;
CREATE POLICY "Post hashtags are viewable by everyone" ON public.post_hashtags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated create post hashtags" ON public.post_hashtags;
CREATE POLICY "Authenticated create post hashtags" ON public.post_hashtags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated delete post hashtags" ON public.post_hashtags;
CREATE POLICY "Authenticated delete post hashtags" ON public.post_hashtags FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.extract_hashtags(content TEXT)
RETURNS TEXT[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE hashtag_array TEXT[];
BEGIN
  SELECT array_agg(DISTINCT lower(substring(word from 2)))
  INTO hashtag_array
  FROM regexp_split_to_table(content, '\s+') AS word
  WHERE word ~ '^#[a-zA-Z0-9_]+$';
  RETURN COALESCE(hashtag_array, ARRAY[]::TEXT[]);
END;
$$;

-- Indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'videos' AND indexname = 'idx_videos_user_id') THEN
    CREATE INDEX idx_videos_user_id ON public.videos(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'videos' AND indexname = 'idx_videos_created_at') THEN
    CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'hashtags' AND indexname = 'idx_hashtags_tag') THEN
    CREATE INDEX idx_hashtags_tag ON public.hashtags(tag);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'hashtags' AND indexname = 'idx_hashtags_use_count') THEN
    CREATE INDEX idx_hashtags_use_count ON public.hashtags(use_count DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'profiles' AND indexname = 'idx_profiles_username') THEN
    CREATE INDEX idx_profiles_username ON public.profiles(username);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'posts' AND indexname = 'idx_posts_caption') THEN
    CREATE INDEX idx_posts_caption ON public.posts USING gin(to_tsvector('english', caption));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'videos' AND indexname = 'idx_videos_caption') THEN
    CREATE INDEX idx_videos_caption ON public.videos USING gin(to_tsvector('english', caption));
  END IF;
END $$;

-- SECTION 4: Echoes (Twitter), Groups (LinkedIn)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.echoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.echoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Echoes are viewable by everyone" ON public.echoes;
CREATE POLICY "Echoes are viewable by everyone" ON public.echoes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create own echoes" ON public.echoes;
CREATE POLICY "Users can create own echoes" ON public.echoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own echoes" ON public.echoes;
CREATE POLICY "Users can delete own echoes" ON public.echoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.echo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  echo_id UUID NOT NULL REFERENCES public.echoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(echo_id, user_id)
);
ALTER TABLE public.echo_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Echo likes viewable by everyone" ON public.echo_likes;
CREATE POLICY "Echo likes viewable by everyone" ON public.echo_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like echoes" ON public.echo_likes;
CREATE POLICY "Users can like echoes" ON public.echo_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike echoes" ON public.echo_likes;
CREATE POLICY "Users can unlike echoes" ON public.echo_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.echo_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  echo_id UUID NOT NULL REFERENCES public.echoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.echo_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Echo replies viewable by everyone" ON public.echo_replies;
CREATE POLICY "Echo replies viewable by everyone" ON public.echo_replies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create echo replies" ON public.echo_replies;
CREATE POLICY "Users can create echo replies" ON public.echo_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own echo replies" ON public.echo_replies;
CREATE POLICY "Users can delete own echo replies" ON public.echo_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Group creators can update groups" ON public.groups;
CREATE POLICY "Group creators can update groups" ON public.groups FOR UPDATE TO authenticated USING (auth.uid() = created_by);
DROP POLICY IF EXISTS "Group creators can delete groups" ON public.groups;
CREATE POLICY "Group creators can delete groups" ON public.groups FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group members viewable by everyone" ON public.group_members;
CREATE POLICY "Group members viewable by everyone" ON public.group_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Groups are viewable" ON public.groups;CREATE POLICY "Groups are viewable" ON public.groups FOR SELECT USING (
  NOT is_private OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group posts viewable" ON public.group_posts;
CREATE POLICY "Group posts viewable" ON public.group_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_posts.group_id AND NOT is_private)
);
DROP POLICY IF EXISTS "Members can create group posts" ON public.group_posts;
CREATE POLICY "Members can create group posts" ON public.group_posts FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can delete own group posts" ON public.group_posts;
CREATE POLICY "Users can delete own group posts" ON public.group_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.group_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.group_post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group post likes viewable" ON public.group_post_likes;
CREATE POLICY "Group post likes viewable" ON public.group_post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like group posts" ON public.group_post_likes;
CREATE POLICY "Users can like group posts" ON public.group_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike group posts" ON public.group_post_likes;
CREATE POLICY "Users can unlike group posts" ON public.group_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.group_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.group_post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group post comments viewable" ON public.group_post_comments;
CREATE POLICY "Group post comments viewable" ON public.group_post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can comment on group posts" ON public.group_post_comments;
CREATE POLICY "Users can comment on group posts" ON public.group_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own group comments" ON public.group_post_comments;
CREATE POLICY "Users can delete own group comments" ON public.group_post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id UUID)
RETURNS SETOF public.groups LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT g.* FROM public.groups g INNER JOIN public.group_members gm ON g.id = gm.group_id WHERE gm.user_id = p_user_id ORDER BY g.updated_at DESC; $$;

INSERT INTO storage.buckets (id, name, public) VALUES ('group-media', 'group-media', true) ON CONFLICT DO NOTHING;
DROP POLICY IF EXISTS "Anyone can view group media" ON storage.objects;
CREATE POLICY "Anyone can view group media" ON storage.objects FOR SELECT USING (bucket_id = 'group-media');
DROP POLICY IF EXISTS "Authenticated upload group media" ON storage.objects;
CREATE POLICY "Authenticated upload group media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'group-media');

-- SECTION 5: Blocks & Security
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own blocks" ON public.blocks;
CREATE POLICY "Users can view own blocks" ON public.blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "Users can create own blocks" ON public.blocks;
CREATE POLICY "Users can create own blocks" ON public.blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "Users can delete own blocks" ON public.blocks;
CREATE POLICY "Users can delete own blocks" ON public.blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- SECTION 6: Profile Settings & Moderation
-- ====================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS private_profile BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS like_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follow_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS comment_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reports are viewable by admins" ON public.reports;
CREATE POLICY "Reports are viewable by admins" ON public.reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Add input validation constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'posts_caption_length') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_caption_length CHECK (length(caption) <= 2000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'comments_content_length') THEN
    ALTER TABLE public.comments ADD CONSTRAINT comments_content_length CHECK (length(content) <= 1000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'messages_content_length') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_content_length CHECK (length(content) <= 5000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_bio_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (length(bio) <= 500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_username_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_length CHECK (length(username) >= 3 AND length(username) <= 30);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'profiles_full_name_length') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_full_name_length CHECK (length(full_name) <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'sent_files_name_length') THEN
    ALTER TABLE public.sent_files ADD CONSTRAINT sent_files_name_length CHECK (length(file_name) <= 255);
  END IF;
END $$;

-- Storage file type enforcement
DROP POLICY IF EXISTS "Enforce avatar file types" ON storage.objects;
CREATE POLICY "Enforce avatar file types" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'));

DROP POLICY IF EXISTS "Enforce post image file types" ON storage.objects;
CREATE POLICY "Enforce post image file types" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1] AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'));

DROP POLICY IF EXISTS "Enforce story file types" ON storage.objects;
CREATE POLICY "Enforce story file types" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1] AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'));

DROP POLICY IF EXISTS "Enforce shared file ownership" ON storage.objects;
CREATE POLICY "Enforce shared file ownership" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload shared files" ON storage.objects;
CREATE POLICY "Users can upload shared files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view files shared with them" ON storage.objects;
CREATE POLICY "Users can view files shared with them" ON storage.objects FOR SELECT USING (
  bucket_id = 'shared-files' AND (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (SELECT 1 FROM public.sent_files WHERE file_url LIKE '%' || name AND receiver_id = auth.uid()))
);

DROP POLICY IF EXISTS "Users can upload message files" ON storage.objects;
CREATE POLICY "Users can upload message files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Conversation participants can view message files" ON storage.objects;
CREATE POLICY "Conversation participants can view message files" ON storage.objects FOR SELECT USING (
  bucket_id = 'message-files' AND EXISTS (SELECT 1 FROM public.messages m JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id WHERE m.file_url LIKE '%' || name AND cp.user_id = auth.uid())
);

-- ====================================================================
-- END OF COMPLETE SCHEMA
-- ====================================================================
