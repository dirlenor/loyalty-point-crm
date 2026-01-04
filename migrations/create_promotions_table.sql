-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add line_notify_token column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS line_notify_token TEXT;

-- Create index for active promotions
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);

-- Create index for promotions created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON promotions(created_at DESC);

