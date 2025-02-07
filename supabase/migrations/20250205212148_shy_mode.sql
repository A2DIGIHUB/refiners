/*
  # Add Collections and Tags Support

  1. New Tables
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `media_collections`
      - `media_id` (uuid, references media_files)
      - `collection_id` (uuid, references collections)
    
    - `media_tags`
      - `media_id` (uuid, references media_files)
      - `tag` (text)

  2. Changes
    - Add tags array to media_files table
    - Add description to media_files table
    - Add title to media_files table

  3. Security
    - Enable RLS on new tables
    - Add policies for collections and tags
*/

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_collections junction table
CREATE TABLE IF NOT EXISTS media_collections (
  media_id uuid REFERENCES media_files ON DELETE CASCADE,
  collection_id uuid REFERENCES collections ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (media_id, collection_id)
);

-- Create media_tags table
CREATE TABLE IF NOT EXISTS media_tags (
  media_id uuid REFERENCES media_files ON DELETE CASCADE,
  tag text NOT NULL,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (media_id, tag)
);

-- Add new columns to media_files
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text;

-- Enable RLS on new tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections"
  ON collections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create collections"
  ON collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for media_collections
CREATE POLICY "Users can view their media collections"
  ON media_collections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their media collections"
  ON media_collections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id
      AND c.user_id = auth.uid()
    )
  );

-- Create policies for media_tags
CREATE POLICY "Users can view media tags"
  ON media_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_files mf
      WHERE mf.id = media_id
      AND (mf.user_id = auth.uid() OR mf.public = true)
    )
  );

CREATE POLICY "Users can manage their media tags"
  ON media_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_files mf
      WHERE mf.id = media_id
      AND mf.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for collections
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();