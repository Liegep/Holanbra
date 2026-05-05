import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

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

// Global variable for debugging
let lastWebhookLogs = [];

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

  // Debug Route - Pergunta do usuário: "Onde está o log?"
  app.get('/api/webhooks/debug', (req, res) => {
    res.json({
      message: "Últimos logs do Webhook",
      logs: lastWebhookLogs
    });
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
    const logEntry = {
      timestamp: new Date().toISOString(),
      body: req.body,
      result: null
    };
    
    // Mantém apenas os últimos 10 logs
    lastWebhookLogs.unshift(logEntry);
    if (lastWebhookLogs.length > 10) lastWebhookLogs.pop();

    console.log('--- CasperLet Webhook Received ---');
    console.log('Dados recebidos:', req.body);
    
    const { casperlet_id, status, tenant_key, api_key, expires, remaining_seconds, rental_price } = req.body;
    
    // Security Validation
    if (api_key !== 'holanbra_secret_token') {
      console.warn('Unauthorized webhook attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!casperlet_id) {
      console.error('Webhook error: Missing casperlet_id in request payload');
      return res.status(400).json({ error: 'Missing casperlet_id' });
    }

    const targetId = String(casperlet_id).trim();

    try {
      // Valor exato vindo do SL (limpo e minúsculo)
      const newStatus = (status || '').toLowerCase().trim();
      
      // Calculate expires_at if 'expires' (seconds) or 'remaining_seconds' is provided
      // CasperLet might send 'expires' as a timestamp or 'remaining_seconds' as a duration.
      const seconds = remaining_seconds || expires;
      let expiresAt = null;
      
      if (seconds && !isNaN(Number(seconds))) {
        const val = Number(seconds);
        console.log(`[Webhook] Calculando expiração com valor: ${val}`);
        
        // Se o valor for maior que 1 bilhão, provavelmente é um timestamp Unix (segundos desde 1970)
        // Caso contrário, é uma duração em segundos a partir de agora.
        if (val > 1000000000) {
          expiresAt = new Date(val * 1000).toISOString();
          console.log(`[Webhook] Tratado como TIMESTAMP: ${expiresAt}`);
        } else {
          // Garantimos que somamos o tempo atual (Date.now()) com os segundos recebidos
          expiresAt = new Date(Date.now() + val * 1000).toISOString();
          console.log(`[Webhook] Tratado como DURAÇÃO: ${expiresAt}`);
        }
      }

      console.log(`Tentando update: Tabela "properties" | Coluna "casperlet_id" = "${targetId}" | Novo Status = "${newStatus}" | Expira em = "${expiresAt}"`);

      // Realiza o update na tabela 'properties' filtrando pela coluna 'casperlet_id'
      const updateData = { 
        status: newStatus,
        tenant_name: tenant_key || (newStatus === 'rented' ? 'Ocupado' : 'Disponível'),
        tenant_id: tenant_key || null, // Guardamos o UUID do residente
        updated_at: new Date().toISOString()
      };

      if (expiresAt) updateData.expiry_date = expiresAt;
      if (rental_price) updateData.rental_price = Number(rental_price);

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('casperlet_id', targetId)
        .select();

      if (error) {
        console.error('❌ Erro retornado pelo Supabase:', error.message);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        const msg = `⚠️ Aviso: Nenhuma linha foi alterada. Verifique se o UUID "${targetId}" existe na coluna "casperlet_id" da tabela "properties".`;
        console.warn(msg);
        logEntry.result = { error: 'Not Found', details: msg };
        return res.status(404).json({ 
          success: false, 
          message: 'Imóvel não encontrado ou UUID incompatível',
          checked_uuid: targetId
        });
      }

      console.log(`✅ Sucesso! Status no banco agora é: "${data[0].status}" para o imóvel: "${data[0].name || targetId}"`);
      logEntry.result = { success: true, updated_data: data[0] };
      res.status(200).json({ 
        success: true, 
        message: 'Status atualizado com sucesso',
        updated_to: newStatus,
        property: data[0]
      });
    } catch (err) {
      console.error('❌ Falha crítica no handler:', err.message);
      logEntry.result = { error: 'Critical Failure', message: err.message };
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
        .from('site_settings')
        .select('*')
        .eq('id', 'sl_config')
        .single();
      
      const config = data || { status: "offline", slName: "Victoria Holanbra" };
      res.json({ status: config.status, managers: [{ slName: config.slName, status: config.status, slId: config.slId }] });
    } catch (error) {
      res.json({ status: "offline", managers: [] });
    }
  });

  // Avatar Image Proxy - Resolves DNS issues (NXDOMAIN) for img.secondlife.com
  app.get('/api/avatar/:uuid', async (req, res) => {
    const { uuid } = req.params;
    if (!uuid || uuid === 'null' || uuid === 'undefined') {
      return res.status(400).send('Invalid UUID');
    }

    try {
      const imageUrl = `https://img.secondlife.com/id/${uuid}/image.png`;
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      res.set('Content-Type', response.headers['content-type'] || 'image/png');
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(response.data);
    } catch (error) {
      console.error(`Proxy Error for UUID ${uuid}:`, error.message);
      // Fallback to UI Avatars if Second Life fails
      res.redirect(`https://ui-avatars.com/api/?name=SL&background=111&color=f59e0b&size=512`);
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
