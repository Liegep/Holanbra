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
    const { data, error } = await supabase
      .from('properties')
      .select('id, name_pt, casperlet_id')
      .eq('casperlet_id', targetId);

    if (error) {
      console.error(`❌ [DIAGNOSTIC] Supabase Query Error: ${error.message}`);
      console.error(`Hint: Check if the table "properties" exists and if RLS allows public reading.`);
    } else if (data && data.length > 0) {
      console.log(`✅ [DIAGNOSTIC] SUCCESS: Found property "${data[0].name_pt}" with casperlet_id: ${targetId}`);
    } else {
      console.warn(`⚠️ [DIAGNOSTIC] WARNING: No property found with casperlet_id: ${targetId}`);
      console.warn(`Hint: Please go to the Admin Area and ensure one of your properties has this EXACT CasperLet ID.`);
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

  // Basic Middlewares FIRST to ensure bodies are parsed for the Webhook
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text({ type: '*/*' }));

  // --- LSL / SL UPDATE ROUTE (Short & Direct) ---
  app.all('/sl-update', async (req, res) => {
    // 1. Log the hit immediately
    console.log(`[SL-Update] Hit: ${req.method}`);
    
    // 2. Immediate OK for GET (Health Check)
    if (req.method === 'GET') {
      return res.status(200).send('OK');
    }

    // 3. Process POST
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (e) {
          const extracted = {};
          const regex = /["']?(\w+)["']?\s*[:=]\s*["']?([^"',\s}]+)["']?/g;
          let match;
          while ((match = regex.exec(payload)) !== null) { extracted[match[1]] = match[2]; }
          if (Object.keys(extracted).length > 0) payload = extracted;
        }
      }

      const { casperlet_id, status, tenant_key, tenant_name, api_key, expires, remaining_seconds, rental_price } = payload || {};
      
      // Token check
      if (api_key !== 'holanbra_secret_token') {
        console.warn('[SL-Update] Invalid Token');
        return res.status(200).send('OK'); // Always send OK to SL to avoid error 46/9
      }

      if (casperlet_id) {
        const targetId = String(casperlet_id).trim();
        const newStatus = (status || '').toLowerCase().trim();
        const seconds = remaining_seconds || expires;
        let expiresAt = null;
        if (seconds && !isNaN(Number(seconds))) {
           const val = Number(seconds);
           expiresAt = val > 1000000000 ? new Date(val * 1000).toISOString() : new Date(Date.now() + val * 1000).toISOString();
        }

        const updateData = { 
          status: newStatus,
          tenant_id: tenant_key || null,
          tenant_name: tenant_name || (newStatus === 'rented' ? (tenant_key || 'Ocupado') : 'Disponível'),
          updated_at: new Date().toISOString()
        };
        if (expiresAt) updateData.expiry_date = expiresAt;
        if (rental_price) updateData.rental_price = Number(rental_price);

        await supabase.from('properties').update(updateData).eq('casperlet_id', targetId);
        console.log(`[SL-Update] Processed: ${targetId} -> ${newStatus}`);
      }
    } catch (err) {
      console.error('[SL-Update] Error:', err.message);
    }

    // 4. THE ONLY VALID RESPONSE FOR SL: Just "OK"
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
  });

  // API Webhook - ALSO SIMPLIFIED TO RESPOND WITH OK
  app.all('/api/webhooks/casperlet', async (req, res) => {
    if (req.method === 'GET') return res.send('OK');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed', message: 'This endpoint accepts only POST requests.' });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      rawBody: req.body,
      result: null
    };

    console.log('--- CasperLet Webhook Received (POST) ---');
    
    // Attempt to parse body if it's a string (LSL often sends raw text)
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
        console.log('[Webhook] Raw body string parsed as JSON');
      } catch (e) {
        console.log('[Webhook] Could not parse body as JSON, attempting regex extraction');
        // Fallback: try to extract key-value pairs from text like "casperlet_id: ... status: ..."
        const extracted = {};
        // Match key-value pairs like "key":"value" or key:value
        const regex = /["']?(\w+)["']?\s*[:=]\s*["']?([^"',\s}]+)["']?/g;
        let match;
        while ((match = regex.exec(payload)) !== null) {
          extracted[match[1]] = match[2];
        }
        
        if (Object.keys(extracted).length > 0) {
          payload = extracted;
          console.log('[Webhook] Extracted fields via regex:', payload);
        }
      }
    }
    
    // Mantém apenas os últimos 10 logs
    logEntry.body = payload;
    lastWebhookLogs.unshift(logEntry);
    if (lastWebhookLogs.length > 10) lastWebhookLogs.pop();

    console.log('Dados processados:', payload);
    
    const { 
      casperlet_id, 
      status, 
      tenant_key, 
      tenant_name, 
      api_key, 
      expires, 
      remaining_seconds, 
      rental_price 
    } = payload || {};

    // Fallback for missing body properties if payload is null or not an object
    if (!payload || typeof payload !== 'object') {
       console.error('[Webhook] Invalid Payload Format');
       return res.status(400).json({ error: 'Invalid Payload Format' });
    }

    const headerKey = req.headers['x-api-key'];
    const token = api_key || headerKey;

    if (token !== 'holanbra_secret_token') {
      console.warn(`[Webhook] Unauthorized attempt from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!casperlet_id) {
      console.error('Webhook error: Missing casperlet_id');
      return res.status(400).json({ error: 'Missing casperlet_id' });
    }

    const targetId = String(casperlet_id).trim();

    try {
      const newStatus = (status || '').toLowerCase().trim();
      const seconds = remaining_seconds || expires;
      let expiresAt = null;
      
      if (seconds && !isNaN(Number(seconds))) {
        const val = Number(seconds);
        if (val > 1000000000) {
          expiresAt = new Date(val * 1000).toISOString();
        } else {
          expiresAt = new Date(Date.now() + val * 1000).toISOString();
        }
      }

      console.log(`[Webhook] Update Target: casperlet_id="${targetId}" | Status="${newStatus}"`);

      // Diagnostic check...
      const { data: existingProp, error: checkError } = await supabase
        .from('properties')
        .select('id, name_pt, casperlet_id')
        .eq('casperlet_id', targetId)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        console.warn(`❌ [Webhook] Property with casperlet_id "${targetId}" WAS NOT FOUND.`);
      }

      const updateData = { 
        status: newStatus,
        tenant_id: tenant_key || null,
        updated_at: new Date().toISOString()
      };

      if (tenant_name) {
        updateData.tenant_name = tenant_name;
      } else if (newStatus === 'rented') {
        updateData.tenant_name = tenant_key || 'Ocupado';
      } else {
        updateData.tenant_name = 'Disponível';
      }

      if (expiresAt) updateData.expiry_date = expiresAt;
      if (rental_price) updateData.rental_price = Number(rental_price);

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('casperlet_id', targetId)
        .select();

      if (error) {
        console.error('❌ Supabase Error:', error.message);
        return res.status(500).json({ error: error.message });
      }

      console.log(`✅ Success! Updated: ${data[0].name_pt || data[0].id}`);
    } catch (err) {
      console.error('❌ Webhook Critical Error:', err.message);
    }
    
    // Final response
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
  });

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
