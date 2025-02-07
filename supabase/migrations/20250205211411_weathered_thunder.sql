/*
  # Storage and Media Management Schema

  1. New Tables
    - `media_files`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `bucket` (text)
      - `path` (text)
      - `size` (bigint)
      - `mime_type` (text)
      - `metadata` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `public` (boolean)

  2. Security
    - Enable RLS on media_files table
    - Add policies for authenticated users
*/

-- Create media_files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  bucket text NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users NOT NULL,
  public boolean DEFAULT false,
  UNIQUE(bucket, path)
);

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public = true);

CREATE POLICY "Users can upload their own files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();