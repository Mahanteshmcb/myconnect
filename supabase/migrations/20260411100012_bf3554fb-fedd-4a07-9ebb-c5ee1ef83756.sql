
-- Echoes table
CREATE TABLE IF NOT EXISTS public.echoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.echoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Echoes are viewable by everyone" ON public.echoes FOR SELECT USING (true);
CREATE POLICY "Users can create own echoes" ON public.echoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own echoes" ON public.echoes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Echo likes
CREATE TABLE IF NOT EXISTS public.echo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  echo_id UUID NOT NULL REFERENCES public.echoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(echo_id, user_id)
);
ALTER TABLE public.echo_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Echo likes viewable by everyone" ON public.echo_likes FOR SELECT USING (true);
CREATE POLICY "Users can like echoes" ON public.echo_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike echoes" ON public.echo_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Echo replies
CREATE TABLE IF NOT EXISTS public.echo_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  echo_id UUID NOT NULL REFERENCES public.echoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.echo_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Echo replies viewable by everyone" ON public.echo_replies FOR SELECT USING (true);
CREATE POLICY "Users can create echo replies" ON public.echo_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own echo replies" ON public.echo_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Groups table (no RLS SELECT policy yet - added after group_members)
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
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update groups" ON public.groups FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete groups" ON public.groups FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Group members (must be created before groups SELECT policy)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Now add groups SELECT policy (group_members exists now)
CREATE POLICY "Groups are viewable" ON public.groups FOR SELECT USING (
  NOT is_private OR EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()
  )
);

-- Group posts
CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group posts viewable" ON public.group_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_posts.group_id AND NOT is_private)
);
CREATE POLICY "Members can create group posts" ON public.group_posts FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own group posts" ON public.group_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Group post likes
CREATE TABLE IF NOT EXISTS public.group_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.group_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group post likes viewable" ON public.group_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like group posts" ON public.group_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike group posts" ON public.group_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Group post comments
CREATE TABLE IF NOT EXISTS public.group_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.group_post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group post comments viewable" ON public.group_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on group posts" ON public.group_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own group comments" ON public.group_post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to get user's groups
CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id UUID)
RETURNS SETOF public.groups
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.* FROM public.groups g
  INNER JOIN public.group_members gm ON g.id = gm.group_id
  WHERE gm.user_id = p_user_id
  ORDER BY g.updated_at DESC;
$$;

-- Storage bucket for group media
INSERT INTO storage.buckets (id, name, public) VALUES ('group-media', 'group-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view group media" ON storage.objects FOR SELECT USING (bucket_id = 'group-media');
CREATE POLICY "Authenticated upload group media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'group-media');

-- Hashtag policies for authenticated users
CREATE POLICY "Authenticated users can create hashtags" ON public.hashtags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hashtags" ON public.hashtags FOR UPDATE TO authenticated USING (true);

-- Post hashtags policies
CREATE POLICY "Authenticated create post hashtags" ON public.post_hashtags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete post hashtags" ON public.post_hashtags FOR DELETE TO authenticated USING (true);
