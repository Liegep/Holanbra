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

// STARTUP DIAGNOSTIC
async function runStartupDiagnostics() {
  const targetId = "47a35db5-29f0-212b-b891-a3fb69a04833";
  console.log(`\n--- 🔍 STARTUP DIAGNOSTIC: Checking CasperLet ID: ${targetId} ---`);
  
  try {
    // Probe for columns
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, casperlet_id')
      .limit(1);

    if (error) {
      console.error(`❌ [DIAGNOSTIC] Supabase Query Error: ${error.message}`);
      if (error.message.includes('column "name" does not exist')) {
        console.error('CRITICAL: "name" column is missing! Please create it in Supabase.');
      }
    } else {
      console.log(`✅ [DIAGNOSTIC] Basic structure OK (id, name, casperlet_id)`);
    }

    const { data: propData, error: propError } = await supabase
      .from('properties')
      .select('id, name, casperlet_id')
      .eq('casperlet_id', targetId);

    if (propError) {
      console.error(`❌ [DIAGNOSTIC] Supabase Property Query Error: ${propError.message}`);
    } else if (propData && propData.length > 0) {
      console.log(`✅ [DIAGNOSTIC] SUCCESS: Found property "${propData[0].name}" with casperlet_id: ${targetId}`);
    } else {
      console.warn(`⚠️ [DIAGNOSTIC] WARNING: No property found with casperlet_id: ${targetId}`);
    }
  } catch (err) {
    console.error(`❌ [DIAGNOSTIC] Critical Error during startup check: ${err.message}`);
  }
  console.log('--- END DIAGNOSTIC ---\n');
}

// Global variable for debugging
let lastWebhookLogs = [];

async function startServer() {
  // Run diagnostics after client is ready
  runStartupDiagnostics().catch(console.error);

  const app = express();

  // 1. DATA PARSERS (Handles standard formats)
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Text allows us to catch raw text payloads from LSL if Content-Type is missing or plain
  app.use(express.text({ type: ['text/plain', 'application/x-www-form-urlencoded'] }));

  // 2. SL UPDATE ROUTE (DIRECT DB SAVER)
  app.all('/sl-update', async (req, res) => {
    // Pegamos os dados da query (URL) ou do body (POST)
    const payload = { ...req.query, ...req.body };
    const { id, status, tenant, token, expiry } = payload;

    // Log para ver o que chegou
    console.log(`[SL-Update] Recebido: ID=${id}, Status=${status}, Expiry=${expiry}`);

    // Validação básica do token de segurança
    if (token !== 'holanbra_secret_token') {
      console.warn('[SL-Update] Token inválido recebido.');
      return res.status(200).send('ERROR - Invalid Token');
    }

    if (!id) {
       return res.status(200).send('ERROR - Missing ID');
    }

    try {
      // Definimos o que será gravado
      const updateData = {
        status: (status || '').toLowerCase().trim(),
        tenant_name: (status === 'available') ? null : (tenant || null),
        tenant_id: (status === 'available') ? null : (payload.tenant_id || null),
        updated_at: new Date().toISOString()
      };

      // CORREÇÃO CRUCIAL: O Second Life envia Segundos (Unix Timestamp)
      // O JavaScript Date() precisa de MILISSEGUNDOS!
      if (status !== 'available' && expiry && expiry !== "0") {
        const seconds = parseInt(expiry);
        const date = new Date(seconds * 1000); // Multiplicamos por 1000 aqui!
        updateData.expiry_date = date.toISOString();
        console.log(`[SL-Update] Convertendo expiry: ${expiry} s -> ${updateData.expiry_date}`);
      } else {
        updateData.expiry_date = null;
      }

      // Executa o UPDATE no Supabase
      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('casperlet_id', String(id).trim())
        .select();

      // LOG DE ERRO EXPLICÍTO PARA O SUPABASE
      if (error) {
        console.error('❌ ERRO NO SUPABASE:', error.message);
        return res.status(200).send(`ERROR - DB: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log(`✅ SUCESSO: Imóvel ${data[0].name || id} atualizado para ${status}`);
        return res.status(200).send('OK - Gravado');
      } else {
        console.warn(`⚠️ AVISO: Nenhum imóvel encontrado com casperlet_id: ${id}`);
        return res.status(200).send('ERROR - ID Not Found');
      }
    } catch (err) {
      console.error('❌ FALHA NO PROCESSAMENTO:', err.message);
      return res.status(200).send('ERROR - Server Failure');
    }
  });

  // 3. DEPRECATED ROUTE
  app.all('/api/webhooks/casperlet', (req, res) => res.send("OK - Use /sl-update"));


  // Logging and Health routes
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

  // Other API Routes
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
