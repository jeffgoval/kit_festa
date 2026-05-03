-- Fix Profile RLS: Allow users to update their own profile information
-- Currently, regular 'gestor' users can only READ their profiles.
-- This migration adds the UPDATE policy.

create policy "User can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
