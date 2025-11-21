-- Create security definer function to check conversation participation
create or replace function public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = _conversation_id
      and user_id = _user_id
  )
$$;

-- Drop the existing problematic policy
drop policy if exists "Users can view conversation participants" on public.conversation_participants;

-- Create new policy using the security definer function
create policy "Users can view conversation participants"
on public.conversation_participants
for select
using (public.is_conversation_participant(conversation_id, auth.uid()));