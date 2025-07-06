-- Create settings table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Public read access" ON settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (admins) to insert/update settings
CREATE POLICY "Admin can manage settings" ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default sponsor advert setting
INSERT INTO settings (key, value, description) 
VALUES ('sponsor_advert_image', NULL, 'URL of the sponsor advertisement image displayed on the Sponsors page')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for sponsor adverts
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-adverts', 'sponsor-adverts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for sponsor adverts bucket
CREATE POLICY "Public can view sponsor adverts" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'sponsor-adverts');

CREATE POLICY "Authenticated users can upload sponsor adverts" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sponsor-adverts');

CREATE POLICY "Authenticated users can update sponsor adverts" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'sponsor-adverts');

CREATE POLICY "Authenticated users can delete sponsor adverts" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'sponsor-adverts');