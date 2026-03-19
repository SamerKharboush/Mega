-- PathAI Studio Database Schema
-- Run this in Supabase SQL Editor

-- Slides
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  format TEXT CHECK (format IN ('svs','ndpi','tiff','mrxs','scn')),
  status TEXT DEFAULT 'uploaded',
  tile_count INT,
  dzi_path TEXT,
  width_px INT,
  height_px INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analyses
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID REFERENCES slides NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  task TEXT CHECK (task IN ('subtype','mutation','prognosis','ihc','tme')),
  status TEXT DEFAULT 'queued',
  model_version TEXT,
  results JSONB,
  heatmap_path TEXT,
  report_path TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  slides_used_this_month INT DEFAULT 0,
  slides_limit INT DEFAULT 20,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage events (for Stripe metered billing)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  analysis_id UUID REFERENCES analyses,
  stripe_meter_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own slides" ON slides USING (auth.uid() = user_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analyses" ON analyses USING (auth.uid() = user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON subscriptions USING (auth.uid() = user_id);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage events" ON usage_events USING (auth.uid() = user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON reports USING (auth.uid() = user_id);

-- Create storage bucket for slides
INSERT INTO storage.buckets (id, name, public)
VALUES ('slides', 'slides', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "users can upload slides"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'slides' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users can read own slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'slides' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, slides_limit)
  VALUES (NEW.id, 'free', 20);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_slides_user_id ON slides(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_status ON slides(status);
CREATE INDEX IF NOT EXISTS idx_analyses_slide_id ON analyses(slide_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);