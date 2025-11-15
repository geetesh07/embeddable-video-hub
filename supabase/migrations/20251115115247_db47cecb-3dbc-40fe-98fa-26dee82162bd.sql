-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  5368709120, -- 5GB limit
  ARRAY['video/mp4', 'video/x-matroska', 'video/mkv']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for subtitles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'subtitles',
  'subtitles',
  true,
  10485760, -- 10MB limit
  ARRAY['text/vtt', 'text/srt', 'application/x-subrip']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Public video access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Anyone can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

CREATE POLICY "Anyone can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');

-- Storage policies for subtitles bucket
CREATE POLICY "Public subtitle access"
ON storage.objects FOR SELECT
USING (bucket_id = 'subtitles');

CREATE POLICY "Anyone can upload subtitles"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'subtitles');

CREATE POLICY "Anyone can update subtitles"
ON storage.objects FOR UPDATE
USING (bucket_id = 'subtitles');

CREATE POLICY "Anyone can delete subtitles"
ON storage.objects FOR DELETE
USING (bucket_id = 'subtitles');

-- Storage policies for thumbnails bucket
CREATE POLICY "Public thumbnail access"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Anyone can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails');

-- Create folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  format TEXT, -- mp4, mkv
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subtitles table
CREATE TABLE public.subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  label TEXT NOT NULL, -- Display name like "English", "Spanish"
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;

-- Public access policies for folders
CREATE POLICY "Public folder read access"
ON public.folders FOR SELECT
USING (true);

CREATE POLICY "Anyone can create folders"
ON public.folders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update folders"
ON public.folders FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete folders"
ON public.folders FOR DELETE
USING (true);

-- Public access policies for videos
CREATE POLICY "Public video read access"
ON public.videos FOR SELECT
USING (true);

CREATE POLICY "Anyone can create videos"
ON public.videos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
ON public.videos FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete videos"
ON public.videos FOR DELETE
USING (true);

-- Public access policies for subtitles
CREATE POLICY "Public subtitle read access"
ON public.subtitles FOR SELECT
USING (true);

CREATE POLICY "Anyone can create subtitles"
ON public.subtitles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update subtitles"
ON public.subtitles FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete subtitles"
ON public.subtitles FOR DELETE
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_videos_folder_id ON public.videos(folder_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_subtitles_video_id ON public.subtitles(video_id);
CREATE INDEX idx_folders_created_at ON public.folders(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();