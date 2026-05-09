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

-- Detailed Initial Content
INSERT INTO faqs (category, display_order, question_en, answer_en, question_pt, answer_pt) VALUES
('technical', 1, 
 'How to configure the security system?', 
 '1. Rez the Security Orb near your teleport point.\n2. Click the orb to access the menu.\n3. Add your friends to the "White List" via the "Access" submenu.\n4. Set the range (we recommend 20m for most parcels).\n5. Click "Activate" to start protection.',
 'Como configurar o sistema de segurança?', 
 '1. Retire o Security Orb perto do seu ponto de teleporte.\n2. Clique no orb para acessar o menu.\n3. Adicione seus amigos à "White List" através do submenu "Access".\n4. Defina o alcance (recomendamos 20m para a maioria dos lotes).\n5. Clique em "Ativar" para iniciar a proteção.'),

('land', 2, 
 'How to deed an object to the land?', 
 '1. Right-click the object and select "Edit".\n2. In the "General" tab, ensure the group matches the land group.\n3. Check the box "Share with group".\n4. Click the "Deed" button. Note: You must have permission in the group to deed objects.',
 'Como fazer deed de um objeto para o terreno?', 
 '1. Clique com o botão direito no objeto e selecione "Editar".\n2. Na aba "Geral", verifique se o grupo coincide com o grupo do terreno.\n3. Marque a caixa "Share with group".\n4. Clique no botão "Deed". Nota: Você precisa ter permissão no grupo para fazer deed de objetos.'),

('billing', 3, 
 'My rental expired, can I get my furniture back?', 
 'If your rental expires, the system automatically returns all objects to your Lost and Found folder. We allow a 24-hour grace period before the objects are returned. Always keep your rental updated to avoid this.',
 'Meu aluguel expirou, posso recuperar meus móveis?', 
 'Se o seu aluguel expirar, o sistema devolve automaticamente todos os objetos para a sua pasta Lost and Found. Permitimos um período de carência de 24 horas antes que os objetos sejam devolvidos. Mantenha sempre seu aluguel em dia para evitar isso.'),

('land', 4, 
 'How do I check my prim usage?', 
 'Look at the top of your screen for the Land Info or right-click the ground, select "About Land", and go to the "Objects" tab. There you will see "User Prims" vs "Parcel Capacity".',
 'Como verifico meu uso de prims?', 
 'Olhe no topo da sua tela no Land Info ou clique com o botão direito no chão, selecione "About Land" (Sobre o Terreno) e vá para a aba "Objects". Lá você verá "User Prims" vs "Parcel Capacity".'),

('others', 5, 
 'How to get support during weekends?', 
 'Our resident portal is active 24/7. Open a support ticket via the Support tab and our on-duty staff will respond within 4-8 hours even during weekends.',
 'Como obter suporte nos fins de semana?', 
 'Nosso portal do residente está ativo 24/7. Abra um ticket de suporte através da aba Suporte e nossa equipe de plantão responderá dentro de 4 a 8 horas, mesmo nos fins de semana.');
