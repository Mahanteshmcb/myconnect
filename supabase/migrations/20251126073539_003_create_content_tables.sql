/*
  # Content Tables (Videos, Stories, Reels)

  1. New Tables
    - `long_form_videos` - YouTube-style long videos
      - `id` (uuid, primary key)
      - `author_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `thumbnail_url` (text)
      - `video_url` (text)
      - `duration` (integer, seconds)
      - `type` (text: 'video', 'short', 'live')
      - `privacy` (text: 'public', 'private', 'unlisted')
      - `views_count` (integer)
      - `likes_count` (integer)
      - `dislikes_count` (integer)
      - `comments_count` (integer)
      - `shares_count` (integer)
      - `category` (text)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `short_videos` (reels/tiktok style)
      - Similar fields to long_form_videos but optimized for short content
    
    - `stories` - Disappearing content
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text: 'image', 'video', 'audio')
      - `url` (text)
      - `audio_url` (text)
      - `caption` (text)
      - `is_viewed` (boolean)
      - `duration` (integer, seconds)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, typically 24h)
      - Automatically delete old stories
    
    - `story_interactions` - Polls, quizzes, mentions
      - `id` (uuid, primary key)
      - `story_id` (uuid)
      - `type` (text: 'poll', 'quiz', 'mention')
      - `position_x` (numeric)
      - `position_y` (numeric)
      - `data` (jsonb)
      - `created_at` (timestamp)
    
    - `story_views` - Track who viewed stories
      - `id` (uuid, primary key)
      - `story_id` (uuid)
      - `viewer_id` (uuid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public can read public videos
    - Users can only delete their own content
    - Story views are private
*/

CREATE TABLE IF NOT EXISTS long_form_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  duration integer,
  type text DEFAULT 'video',
  privacy text DEFAULT 'public',
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  category text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS short_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  description text,
  filter text,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  url text,
  audio_url text,
  caption text,
  is_viewed boolean DEFAULT false,
  duration integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE TABLE IF NOT EXISTS story_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  type text NOT NULL,
  position_x numeric,
  position_y numeric,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

ALTER TABLE long_form_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public long videos"
  ON long_form_videos FOR SELECT
  TO authenticated
  USING (privacy = 'public' OR auth.uid() = author_id);

CREATE POLICY "Users can create long videos"
  ON long_form_videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own long videos"
  ON long_form_videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own long videos"
  ON long_form_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read short videos"
  ON short_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create short videos"
  ON short_videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own short videos"
  ON short_videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own short videos"
  ON short_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can read non-expired stories"
  ON stories FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read story interactions"
  ON story_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read story views"
  ON story_views FOR SELECT
  TO authenticated
  USING (auth.uid() = viewer_id OR auth.uid() IN (
    SELECT user_id FROM stories WHERE id = story_id
  ));

CREATE POLICY "Users can create story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

CREATE INDEX idx_long_videos_author_id ON long_form_videos(author_id);
CREATE INDEX idx_long_videos_created_at ON long_form_videos(created_at DESC);
CREATE INDEX idx_long_videos_privacy ON long_form_videos(privacy);
CREATE INDEX idx_short_videos_author_id ON short_videos(author_id);
CREATE INDEX idx_short_videos_created_at ON short_videos(created_at DESC);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_story_interactions_story_id ON story_interactions(story_id);
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_viewer_id ON story_views(viewer_id);
