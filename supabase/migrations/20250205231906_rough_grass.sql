/*
  # Create media storage bucket

  1. Changes
    - Creates a new storage bucket named 'media' for file uploads
    - Sets up public access policies for the bucket
    - Enables RLS for secure file access

  2. Security
    - Enables RLS on the storage.buckets table
    - Adds policies for authenticated users to upload files
    - Allows public read access for shared files
*/

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media' AND owner IS NULL);

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow owners to update their files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "Allow owners to delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());