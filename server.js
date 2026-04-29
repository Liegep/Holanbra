import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://kwosiiddjwkajvatgudp.supabase.co';
// CRITICAL: For server-side updates, we MUST use the SERVICE_ROLE_KEY to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b3NpaWRkandrYWp2YXRndWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTgwMDgsImV4cCI6MjA5MzAzNDAwOH0.33En7oofSwpWDK-lScNDCob98kBJCFGstMbAU-wGvZg';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY not found in environment. Webhook updates may fail due to RLS.');
} else {
  console.log('✅ INFO: Using SUPABASE_SERVICE_ROLE_KEY for database operations.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ... (existing logging and health routes)
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // API Routes
  app.post('/api/webhooks/casperlet', async (req, res) => {
    console.log('--- CasperLet Webhook Received ---');
    console.log('Dados recebidos:', req.body);
    
    const { casperlet_id, status, tenant_key, api_key } = req.body;
    
    // Security Validation
    if (api_key !== 'holanbra_secret_token') {
      console.warn('Unauthorized webhook attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!casperlet_id) {
      console.error('Webhook error: Missing casperlet_id in request payload');
      return res.status(400).json({ error: 'Missing casperlet_id' });
    }

    try {
      // Valor exato vindo do SL (limpo e minúsculo)
      const newStatus = (status || '').toLowerCase().trim();

      console.log(`Buscando imóvel com casperlet_id: "${casperlet_id}" para atualizar status para: "${newStatus}"`);

      // Realiza o update na tabela 'properties' filtrando pela coluna 'casperlet_id'
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status: newStatus,
          tenant_name: tenant_key || (newStatus === 'rented' ? 'Ocupado' : 'Disponível'),
          updated_at: new Date().toISOString()
        })
        .eq('casperlet_id', casperlet_id)
        .select();

      if (error) {
        console.error('Erro no Supabase:', error.message);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        console.warn(`Atenção: Nenhum imóvel encontrado com o UUID: ${casperlet_id}`);
        return res.status(404).json({ 
          success: false, 
          message: 'Imóvel não encontrado na tabela properties',
          checked_uuid: casperlet_id
        });
      }

      console.log(`✅ Sucesso! Imóvel atualizado:`, data[0]);
      res.status(200).json({ 
        success: true, 
        message: 'Status atualizado com sucesso',
        updated_to: newStatus,
        property: data[0]
      });
    } catch (err) {
      console.error('❌ Falha crítica no handler:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/casperlet/sync', async (req, res) => {
    try {
      const { unit_name, price, status, tenant, casperletId } = req.body;
      const docId = unit_name || casperletId;
      if (!docId) return res.status(400).json({ error: 'Missing unit_name or casperletId' });

      const { error } = await supabase
        .from('properties')
        .upsert({
          id: docId,
          price: price ? Number(price) : 0,
          status: status || "available",
          tenant_name: tenant || "Disponível",
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/casperlet/status", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'sl_config')
        .single();
      
      const config = data || { status: "offline", slName: "Victoria Holanbra" };
      res.json({ status: config.status, managers: [{ slName: config.slName, status: config.status, slId: config.slId }] });
    } catch (error) {
      res.json({ status: "offline", managers: [] });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port 3000`);
  });
}

startServer().catch(err => console.error("FATAL:", err));
