-- Create videos table for video posts
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Videos are viewable by everyone"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

-- Create video likes table
CREATE TABLE public.video_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Video likes are viewable by everyone"
  ON public.video_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like videos"
  ON public.video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike videos"
  ON public.video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create video comments table
CREATE TABLE public.video_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Video comments are viewable by everyone"
  ON public.video_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create video comments"
  ON public.video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own video comments"
  ON public.video_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create video storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

-- Storage policies for videos
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create hashtags table for search
CREATE TABLE public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hashtags are viewable by everyone"
  ON public.hashtags FOR SELECT
  USING (true);

-- Create post_hashtags junction table
CREATE TABLE public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (
    (post_id IS NOT NULL AND video_id IS NULL) OR
    (post_id IS NULL AND video_id IS NOT NULL)
  )
);

ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post hashtags are viewable by everyone"
  ON public.post_hashtags FOR SELECT
  USING (true);

-- Function to extract and store hashtags
CREATE OR REPLACE FUNCTION public.extract_hashtags(content TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  hashtag_array TEXT[];
BEGIN
  SELECT array_agg(DISTINCT lower(substring(word from 2)))
  INTO hashtag_array
  FROM regexp_split_to_table(content, '\s+') AS word
  WHERE word ~ '^#[a-zA-Z0-9_]+$';
  
  RETURN COALESCE(hashtag_array, ARRAY[]::TEXT[]);
END;
$$;

-- Create indexes for better search performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_hashtags_tag ON public.hashtags(tag);
CREATE INDEX idx_hashtags_use_count ON public.hashtags(use_count DESC);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_posts_caption ON public.posts USING gin(to_tsvector('english', caption));
CREATE INDEX idx_videos_caption ON public.videos USING gin(to_tsvector('english', caption));