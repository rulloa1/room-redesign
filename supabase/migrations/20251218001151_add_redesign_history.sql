/*
  # Add Redesign History Tracking

  1. New Tables
    - `redesign_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `original_image_url` (text) - URL to the original image
      - `redesigned_image_url` (text) - URL to the redesigned image
      - `style` (text) - The style used for redesign
      - `customizations` (jsonb) - Wall colors, trim, and other customizations
      - `is_favorite` (boolean) - User can mark favorites
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on `redesign_history` table
    - Add policy for authenticated users to read their own history
    - Add policy for authenticated users to insert their own history
    - Add policy for authenticated users to update their own history
    - Add policy for authenticated users to delete their own history
  
  3. Indexes
    - Add index on user_id for faster queries
    - Add index on created_at for sorting
    - Add index on is_favorite for filtering favorites
*/

CREATE TABLE IF NOT EXISTS redesign_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url text NOT NULL,
  redesigned_image_url text NOT NULL,
  style text NOT NULL,
  customizations jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE redesign_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redesign history"
  ON redesign_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redesign history"
  ON redesign_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own redesign history"
  ON redesign_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own redesign history"
  ON redesign_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_redesign_history_user_id ON redesign_history(user_id);
CREATE INDEX IF NOT EXISTS idx_redesign_history_created_at ON redesign_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redesign_history_is_favorite ON redesign_history(user_id, is_favorite) WHERE is_favorite = true;

CREATE OR REPLACE FUNCTION update_redesign_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_redesign_history_updated_at
  BEFORE UPDATE ON redesign_history
  FOR EACH ROW
  EXECUTE FUNCTION update_redesign_history_timestamp();