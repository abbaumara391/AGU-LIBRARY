-- AGULIBRARY SAFE SYSTEM UPGRADE
-- Adds student registry, admin->student notifications, and student invitations support.
-- Does NOT alter the existing resources/admin_users tables.

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_student_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_profiles(user_id,email,full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1))
  )
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, student_profiles.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_agu_profile on auth.users;
create trigger on_auth_user_created_agu_profile
after insert on auth.users
for each row execute function public.sync_student_profile();

insert into public.student_profiles(user_id,email,full_name)
select id,email,coalesce(raw_user_meta_data->>'full_name',raw_user_meta_data->>'name',split_part(coalesce(email,''),'@',1))
from auth.users
on conflict (user_id) do update set
  email=excluded.email,
  full_name=coalesce(excluded.full_name,student_profiles.full_name),
  updated_at=now();

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  send_to_all boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.student_invitations
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.student_invitations
  add column if not exists used_at timestamptz;

alter table public.student_profiles enable row level security;
alter table public.admin_messages enable row level security;

-- Student profiles
 drop policy if exists "student_profiles_self_read" on public.student_profiles;
create policy "student_profiles_self_read" on public.student_profiles
for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "student_profiles_self_update" on public.student_profiles;
create policy "student_profiles_self_update" on public.student_profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Admin messages: students see broadcasts or their own messages; admins see all.
drop policy if exists "admin_messages_student_read" on public.admin_messages;
create policy "admin_messages_student_read" on public.admin_messages
for select to authenticated
using (
  send_to_all = true
  or recipient_user_id = auth.uid()
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "admin_messages_admin_insert" on public.admin_messages;
create policy "admin_messages_admin_insert" on public.admin_messages
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "admin_messages_admin_delete" on public.admin_messages;
create policy "admin_messages_admin_delete" on public.admin_messages
for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Invitations: students may see their own invitations and create one for themselves.
-- If these policies already exist in your project, the named policies below are independent.
drop policy if exists "student_invitations_self_insert" on public.student_invitations;
create policy "student_invitations_self_insert" on public.student_invitations
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "student_invitations_self_read" on public.student_invitations;
create policy "student_invitations_self_read" on public.student_invitations
for select to authenticated
using (created_by = auth.uid() or exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- NOTE: Supabase TOTP MFA is handled by the existing Auth MFA API.
-- The front-end upgrade prompts an administrator for TOTP when 12 hours have elapsed.
-- For strongest enforcement, require AAL2 in sensitive server-side policies as well.


-- Profile expansion for registration and profile photos
alter table public.student_profiles add column if not exists first_name text;
alter table public.student_profiles add column if not exists last_name text;
alter table public.student_profiles add column if not exists middle_name text;
alter table public.student_profiles add column if not exists phone text;
alter table public.student_profiles add column if not exists avatar_url text;
alter table public.student_profiles add column if not exists phone_verified boolean not null default false;

-- Keep one permanent invitation per student without restricting admin-created invitations.
alter table public.student_invitations
  add column if not exists student_owner_id uuid references auth.users(id) on delete cascade;

create unique index if not exists student_invitations_one_per_student
on public.student_invitations(student_owner_id)
where student_owner_id is not null;

-- Students may update only their own profile fields
drop policy if exists "student_profiles_self_update" on public.student_profiles;
create policy "student_profiles_self_update" on public.student_profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Storage policies for profile photos in the existing agu-library bucket
-- These policies only apply to paths beginning with profiles/<current-user-id>/.


-- Student-owned permanent invitations
drop policy if exists "student_invitations_owner_read" on public.student_invitations;
create policy "student_invitations_owner_read" on public.student_invitations
for select to authenticated
using (
  student_owner_id = auth.uid()
  or created_by = auth.uid()
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "student_invitations_owner_insert" on public.student_invitations;
create policy "student_invitations_owner_insert" on public.student_invitations
for insert to authenticated
with check (
  student_owner_id = auth.uid()
  and created_by = auth.uid()
);

-- Profile-photo storage policies for the existing agu-library bucket.
-- Paths must be profiles/<user-id>/...
drop policy if exists "student_profile_photo_insert" on storage.objects;
create policy "student_profile_photo_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'agu-library'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "student_profile_photo_update" on storage.objects;
create policy "student_profile_photo_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'agu-library'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'agu-library'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
);
