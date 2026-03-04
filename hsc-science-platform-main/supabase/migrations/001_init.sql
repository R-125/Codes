CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  email TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','contributor','viewer')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  section TEXT CHECK (section IN ('science','technology')),
  part INTEGER,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf','image','video','link')),
  url TEXT NOT NULL,
  embed_code TEXT,
  is_external BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read content" ON content FOR SELECT USING (true);
CREATE POLICY "Contributors insert" ON content FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','contributor') AND approved=true)
);
CREATE POLICY "Contributors delete own" ON content FOR DELETE USING (
  auth.uid() = uploaded_by OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
CREATE POLICY "Own profile" ON profiles FOR SELECT USING (auth.uid()=id);
CREATE POLICY "Admin all profiles" ON profiles FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role='admin')
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

INSERT INTO subjects (name_en, name_bn, slug, section, part, icon) VALUES
('Physics I',      'পদার্থবিজ্ঞান ১',          'physics-1',     'science',    1, '⚛'),
('Physics II',     'পদার্থবিজ্ঞান ২',          'physics-2',     'science',    2, '⚛'),
('Chemistry I',    'রসায়ন ১',                  'chemistry-1',   'science',    1, '🧪'),
('Chemistry II',   'রসায়ন ২',                  'chemistry-2',   'science',    2, '🧪'),
('Biology I',      'জীববিজ্ঞান ১',             'biology-1',     'science',    1, '🧬'),
('Biology II',     'জীববিজ্ঞান ২',             'biology-2',     'science',    2, '🧬'),
('Higher Math I',  'উচ্চতর গণিত ১',            'higher-math-1', 'science',    1, '∫'),
('Higher Math II', 'উচ্চতর গণিত ২',            'higher-math-2', 'science',    2, '∫'),
('Bangla I',       'বাংলা ১',                   'bangla-1',      'science',    1, '📖'),
('Bangla II',      'বাংলা ২',                   'bangla-2',      'science',    2, '📖'),
('English I',      'ইংরেজি ১',                  'english-1',     'science',    1, '🔤'),
('English II',     'ইংরেজি ২',                  'english-2',     'science',    2, '🔤'),
('ICT',            'তথ্য ও যোগাযোগ প্রযুক্তি', 'ict',           'technology', 1, '💻');

INSERT INTO storage.buckets (id, name, public) VALUES ('hsc-content', 'hsc-content', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read storage" ON storage.objects FOR SELECT USING (bucket_id = 'hsc-content');
CREATE POLICY "Auth upload storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'hsc-content' AND
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','contributor') AND approved=true)
);
