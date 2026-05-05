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

  // 2. SL UPDATE ROUTE (TOP PRIORITY API ROUTE)
  app.all('/sl-update', async (req, res) => {
    // Prepare Response Header - MUST be strictly plain text for Second Life
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 1. Robust Payload Extraction
    let payload = { ...req.query };
    
    // If express parsed it as an object (json or urlencoded)
    if (typeof req.body === 'object' && req.body !== null) {
      payload = { ...payload, ...req.body };
    } 
    // If express parsed it as a string (from express.text)
    else if (typeof req.body === 'string' && req.body.trim().length > 0) {
      const bodyStr = req.body.trim();
      if (bodyStr.startsWith('{')) {
        try { 
          const parsed = JSON.parse(bodyStr);
          payload = { ...payload, ...parsed };
        } catch (e) {
          console.warn('[SL-Update] Failed to parse JSON body string');
        }
      } else {
        // Handle key=value formats
        const params = new URLSearchParams(bodyStr);
        params.forEach((val, key) => { payload[key] = val; });
      }
    }
    
    // Diagnostic log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      combinedPayload: payload,
      message: "Incoming request"
    };
    
    // Reset/Clear logs if requested
    if (payload.clear === 'true' || payload.clear_logs === 'true') {
      lastWebhookLogs = [];
      console.log('[SL-Update] 🧹 Logs cleared.');
    }

    lastWebhookLogs.unshift(logEntry);
    if (lastWebhookLogs.length > 20) lastWebhookLogs.pop();

    try {
      // 2. Extract values strictly
      const id = (payload.id || payload.casperlet_id || payload.casperlet || '').toString().trim();
      const statusFromReq = (payload.status || payload.state || '').toString().toLowerCase().trim();
      const token = (payload.api_key || payload.token || payload.apikey || payload.secret || '').toString().trim();
      const tenantName = payload.tenant || payload.tenant_name || payload.name || payload.resident || null;
      const duration = payload.duration || payload.remaining_seconds || payload.expires || null;

      if (!id) {
        logEntry.db_status = "Skipped: Missing ID";
        console.warn(`[SL-Update] Webhook received without ID.`);
        return res.status(200).send("ERROR - Missing ID");
      }

      if (token !== 'holanbra_secret_token') {
        logEntry.db_status = "Skipped: Invalid Token";
        console.warn(`[SL-Update] Unauthorized token: "${token}"`);
        return res.status(200).send("ERROR - Invalid Token");
      }

      // 3. Build update payload according to rules
      let updateData = {
        updated_at: new Date().toISOString()
      };

      if (statusFromReq === 'available') {
        // CLEAR fields if available
        updateData.status = 'available';
        updateData.tenant_id = null;
        updateData.tenant_name = null;
        updateData.expiry_date = null;
        console.log(`[SL-Update] 🧹 CLEANUP for available status (ID: ${id})`);
      } else {
        // SET fields if occupied
        updateData.status = statusFromReq || 'rented';
        updateData.tenant_name = tenantName || null;
        updateData.tenant_id = payload.tenant_id || payload.tenant_key || null;
        
        if (duration && !isNaN(Number(duration))) {
          const val = Number(duration);
          // If duration > 1B, it's a timestamp; otherwise it's remaining seconds
          const dateObj = val > 1000000000 ? new Date(val * 1000) : new Date(Date.now() + val * 1000);
          updateData.expiry_date = dateObj.toISOString();
        }
        console.log(`[SL-Update] 🏠 OCCUPIED status update (ID: ${id})`);
      }

      // 4. Update Supabase
      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('casperlet_id', id)
        .select();
      
      if (error) {
        console.error(`[SL-Update] ❌ SUPABASE ERROR:`, error.message);
        logEntry.db_status = "Error: " + error.message;
        return res.status(200).send("ERROR - DB Failure");
      } 
      
      if (data && data.length > 0) {
        const propName = data[0].name || id;
        console.log(`[SL-Update] ✅ SUCCESS: Updated "${propName}" to "${statusFromReq}"`);
        logEntry.db_status = "Success: Updated " + propName;
        // Strictly return the success message requested
        return res.send("OK - Atualizado");
      } else {
        console.warn(`[SL-Update] ⚠️ ID not matched in DB: "${id}"`);
        logEntry.db_status = "NotFound: ID not found";
        return res.status(200).send("ERROR - ID Not Found");
      }
    } catch (err) {
      console.error(`[SL-Update] ❌ CRITICAL FAILURE:`, err.message);
      logEntry.db_status = "Critical failure";
      return res.status(200).send("ERROR - Logic Error");
    }
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
        .select('id, name, casperlet_id')
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

      const propName = data[0].name || data[0].id;
      console.log(`✅ Success! Updated: ${propName}`);
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
