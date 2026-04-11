-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

-- Create a new INSERT policy that allows adding participants
-- A user can insert if they are adding themselves, OR if they are already a participant
CREATE POLICY "Users can add conversation participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_conversation_participant(conversation_id, auth.uid())
);