-- ============================================
-- Run this script ONLY in the Supabase Dashboard SQL Editor
-- It creates the report-evidence storage bucket and access policies.
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
-- ============================================

-- 1. Create the storage bucket (if not exists)
insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values (
  'report-evidence',
  'report-evidence',
  true,
  false,
  10485760,
  array[
    'image/png'::text, 'image/jpeg'::text, 'image/jpg'::text, 'image/webp'::text, 'image/gif'::text,
    'application/pdf'::text, 'application/zip'::text, 'application/x-rar-compressed'::text,
    'text/plain'::text, 'text/html'::text,
    'application/octet-stream'::text
  ]
)
on conflict (id) do nothing;

-- 2. Create RLS policies for the bucket (only if they don't exist)
do $$
begin
  -- Allow authenticated users to read evidence files
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Allow read access to report-evidence bucket'
  ) then
    create policy "Allow read access to report-evidence bucket"
      on storage.objects for select
      using ( bucket_id = 'report-evidence' );
  end if;

  -- Allow authenticated users to insert evidence files
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Allow insert access to report-evidence bucket'
  ) then
    create policy "Allow insert access to report-evidence bucket"
      on storage.objects for insert
      with check ( bucket_id = 'report-evidence' );
  end if;

  -- Allow users to update evidence files
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Allow update access to report-evidence bucket'
  ) then
    create policy "Allow update access to report-evidence bucket"
      on storage.objects for update
      using ( bucket_id = 'report-evidence' );
  end if;

  -- Allow users to delete evidence files
  if not exists (
    select 1 from pg_policies 
    where tablename = 'objects' 
    and policyname = 'Allow delete access to report-evidence bucket'
  ) then
    create policy "Allow delete access to report-evidence bucket"
      on storage.objects for delete
      using ( bucket_id = 'report-evidence' );
  end if;
end $$;