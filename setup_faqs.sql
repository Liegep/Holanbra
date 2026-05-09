-- FAQ Table Setup
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'others',
  display_order INTEGER DEFAULT 0,
  question_en TEXT DEFAULT '',
  answer_en TEXT DEFAULT '',
  question_pt TEXT DEFAULT '',
  answer_pt TEXT DEFAULT '',
  question_es TEXT DEFAULT '',
  answer_es TEXT DEFAULT '',
  question_nl TEXT DEFAULT '',
  answer_nl TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read FAQs
CREATE POLICY "Public can view faqs" ON faqs
  FOR SELECT USING (true);

-- Policy: Only authenticated users (admins) can modify FAQs
CREATE POLICY "Authenticated users can manage faqs" ON faqs
  FOR ALL USING (auth.role() = 'authenticated');

-- Optional: Initial content based on user common questions
-- Note: Answers should be filled in the Admin Panel
INSERT INTO faqs (category, display_order, question_en, question_pt) VALUES
('technical', 1, 'How to configure the security system?', 'Como configurar o Security System?'),
('land', 2, 'How to deed an object to the land?', 'Como fazer deed de um objeto para a land?'),
('land', 3, 'How to set a group on the land?', 'Como colocar grupo na land?'),
('others', 4, 'Who can help when everything fails?', 'Quem pode ajudar quando tudo falhar?'),
('land', 5, 'How do I know how many prims I used?', 'Como sei quantos prims eu usei?'),
('land', 6, 'How to put stream on my land?', 'Como colocar stream na minha land?');
