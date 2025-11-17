-- Fix critical RLS bug in conversations table
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Add storage policies to enforce file type restrictions (file size must be set in bucket config)
-- Policy for avatars bucket (images only)
CREATE POLICY "Enforce avatar file types"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'))
);

-- Policy for posts bucket (images only)
CREATE POLICY "Enforce post image file types"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'))
);

-- Policy for stories bucket (images/videos)
CREATE POLICY "Enforce story file types"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'stories'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'))
);

-- Policy for shared-files bucket (user ownership only)
CREATE POLICY "Enforce shared file ownership"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'shared-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);