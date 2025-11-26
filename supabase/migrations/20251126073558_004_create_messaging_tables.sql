/*
  # Messaging and Chat Tables

  1. New Tables
    - `chat_sessions` - Direct messages and group chats
      - `id` (uuid, primary key)
      - `is_group` (boolean)
      - `group_name` (text)
      - `group_avatar` (text)
      - `group_description` (text)
      - `created_by_id` (uuid)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_participants` - Members of chat sessions
      - `id` (uuid, primary key)
      - `chat_session_id` (uuid)
      - `user_id` (uuid)
      - `is_admin` (boolean)
      - `joined_at` (timestamp)
    
    - `messages` - Individual messages
      - `id` (uuid, primary key)
      - `chat_session_id` (uuid)
      - `sender_id` (uuid)
      - `text` (text)
      - `type` (text: 'text', 'image', 'video', 'audio', 'document')
      - `media_url` (text)
      - `file_name` (text)
      - `file_size` (text)
      - `status` (text: 'sending', 'sent', 'delivered', 'read', 'failed')
      - `reply_to_id` (uuid for threading)
      - `is_ai_message` (boolean)
      - `encryption_hash` (text)
      - `created_at` (timestamp)
    
    - `message_reads` - Track read receipts
      - `id` (uuid, primary key)
      - `message_id` (uuid)
      - `user_id` (uuid)
      - `read_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only see chats they participate in
    - Users can only send messages to chats they're in
*/

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group boolean DEFAULT false,
  group_name text,
  group_avatar text,
  group_description text,
  created_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(chat_session_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text text,
  type text DEFAULT 'text',
  media_url text,
  file_name text,
  file_size text,
  status text DEFAULT 'sent',
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  is_ai_message boolean DEFAULT false,
  encryption_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read chat sessions they participate in"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_session_id = chat_sessions.id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by_id);

CREATE POLICY "Users can update chat sessions they admin"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_session_id = chat_sessions.id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_session_id = chat_sessions.id
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.is_admin = true
    )
  );

CREATE POLICY "Users can manage chat participants in their chats"
  ON chat_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_session_id = chat_participants.chat_session_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add participants"
  ON chat_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_session_id = chat_participants.chat_session_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can remove participants"
  ON chat_participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_session_id = chat_participants.chat_session_id
      AND user_id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Users can read messages in their chats"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_session_id = messages.chat_session_id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_session_id = messages.chat_session_id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own message status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read read receipts in their chats"
  ON message_reads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_participants cp ON m.chat_session_id = cp.chat_session_id
      WHERE m.id = message_reads.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create read receipts"
  ON message_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_chat_sessions_created_by ON chat_sessions(created_by_id);
CREATE INDEX idx_chat_participants_session_id ON chat_participants(chat_session_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_messages_chat_session_id ON messages(chat_session_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
