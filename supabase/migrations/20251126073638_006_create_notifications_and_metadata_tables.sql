/*
  # Notifications and Metadata Tables

  1. New Tables
    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text: 'like', 'comment', 'follow', 'mention', 'system')
      - `actor_id` (uuid, who triggered the notification)
      - `content` (text)
      - `target_image_url` (text)
      - `target_id` (uuid, link to post/video/user)
      - `is_read` (boolean)
      - `priority` (text: 'high', 'low')
      - `created_at` (timestamp)
    
    - `communities` - User communities/groups
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `avatar_url` (text)
      - `members_count` (integer)
      - `creator_id` (uuid)
      - `tags` (text[])
      - `trending_score` (numeric)
      - `created_at` (timestamp)
    
    - `community_members` - Community membership
      - `id` (uuid, primary key)
      - `community_id` (uuid)
      - `user_id` (uuid)
      - `role` (text: 'member', 'moderator', 'creator')
      - `joined_at` (timestamp)
    
    - `explore_items` - Trending/explore content
      - `id` (uuid, primary key)
      - `content_id` (uuid)
      - `content_type` (text: 'post', 'video', 'short', 'user')
      - `image_url` (text)
      - `likes_count` (integer)
      - `trending_score` (numeric)
      - `category` (text)
      - `created_at` (timestamp)
    
    - `saved_posts` - User bookmarks
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `post_id` (uuid)
      - `created_at` (timestamp)
    
    - `user_preferences` - Content preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `content_tags` (text[])
      - `blocked_users` (uuid[])
      - `muted_keywords` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read their own notifications
    - Communities are publicly readable
    - Preferences are private
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  content text NOT NULL,
  target_image_url text,
  target_id uuid,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'low',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  members_count integer DEFAULT 0,
  creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  trending_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS explore_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  trending_score numeric DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  content_tags text[] DEFAULT '{}',
  blocked_users uuid[] DEFAULT '{}',
  muted_keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE explore_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = actor_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own communities"
  ON communities FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can read community members"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can remove members"
  ON community_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('moderator', 'creator')
    )
  );

CREATE POLICY "Anyone can read explore items"
  ON explore_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read saved posts"
  ON saved_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON saved_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON saved_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_trending_score ON communities(trending_score DESC);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_explore_items_content_type ON explore_items(content_type);
CREATE INDEX idx_explore_items_trending_score ON explore_items(trending_score DESC);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_created_at ON saved_posts(created_at DESC);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
