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
    const payload = { ...req.query, ...req.body };
    const { id, status, tenant, token, expiry } = payload;

    console.log(`[SL-Update] Requisição: ID=${id}, Status=${status}, Expiry=${expiry}`);

    // 1. Validação do Token
    if (token !== 'holanbra_secret_token') {
      console.warn('[SL-Update] Token inválido.');
      return res.status(200).send('ERROR - Invalid Token');
    }

    if (!id) return res.status(200).send('ERROR - Missing ID');

    try {
      const updateData = {
        status: (status || '').toLowerCase().trim(),
        tenant_name: (status === 'available') ? null : (tenant || null),
        tenant_id: (status === 'available') ? null : (payload.tenant_id || null),
        updated_at: new Date().toISOString()
      };

      // 2. Lógica de conversão direta (Unix Segundos -> ISO Milissegundos)
      const expiryRaw = req.query.expiry || payload.expiry;
      let finalDate = null;

      if (status !== 'available' && expiryRaw && expiryRaw !== "0") {
          const expiryTick = Number(expiryRaw);
          if (!isNaN(expiryTick) && expiryTick > 0) {
              finalDate = new Date(expiryTick * 1000).toISOString();
              console.log(`[SL-Update] Data Final calculada: ${finalDate}`);
          }
      }
      
      updateData.expiry_date = finalDate;

      // 3. Executa o UPDATE
      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('casperlet_id', String(id).trim())
        .select();

      if (error) {
        console.error('❌ ERRO SUPABASE:', error.message);
        return res.status(200).send(`ERROR - DB: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log(`✅ SAVED: ${data[0].name || id} | Status: ${status} | Exp: ${finalDate}`);
        return res.status(200).send('OK - Saved');
      } else {
        return res.status(200).send('ERROR - ID Not Found');
      }
    } catch (err) {
      console.error('❌ ERRO CRÍTICO:', err.message);
      return res.status(200).send('ERROR - Server Failure');
    }
  });

  // 3. DEPRECATED ROUTE
  app.all('/api/webhooks/casperlet', (req, res) => res.send("OK - Use /sl-update"));

  // 4. PRIM CHECKER ROUTE
  app.post('/api/prim-update', async (req, res) => {
    const payload = { ...req.query, ...req.body };
    const { resident_key, resident_name, prims_used, token, casperlet_id } = payload;

    console.log(`[Prim-Update] Requisição: Resident=${resident_name}, Prims=${prims_used}, CasperletID=${casperlet_id}`);

    if (token !== 'holanbra_secret_token') {
      return res.status(200).send('ERROR - Invalid Token');
    }

    if (!resident_key) return res.status(200).send('ERROR - Missing Resident Key');

    try {
      // 1. Vincular à propriedade se o id foi fornecido
      let autoLimit = 0;
      if (casperlet_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('prims_allowed')
          .eq('name', casperlet_id)
          .single();
        
        if (prop) autoLimit = prop.prims_allowed || 0;
      }

      // Se não enviou casperlet_id ou não achou, tenta o método antigo pelo renter_uuid
      if (autoLimit === 0) {
        const { data: properties } = await supabase
          .from('properties')
          .select('prims_allowed')
          .eq('renter_uuid', resident_key);
        
        if (properties && properties.length > 0) {
          autoLimit = properties.reduce((acc, p) => acc + (p.prims_allowed || 0), 0);
        }
      }

      // 2. Primeiro, verificamos se o residente já existe
      const { data: existingRes } = await supabase
        .from('prim_residents')
        .select('prim_limit, resident_name')
        .eq('resident_key', resident_key)
        .single();

      // PRIORIDADE: Se temos um limite vindo de uma propriedade vinculada (autoLimit), usamos ele.
      // Caso contrário, mantemos o limite manual que já existia (se for maior que 0).
      const limitToSet = (casperlet_id && autoLimit > 0) ? autoLimit : ((existingRes && existingRes.prim_limit > 0) ? existingRes.prim_limit : autoLimit);

      // Preserva o nome real se o novo vindo do script for apenas um placeholder (ex: "Resident (key)")
      let finalName = resident_name;
      if (existingRes && existingRes.resident_name && resident_name.includes("Resident (")) {
        finalName = existingRes.resident_name;
      }

      // 3. Update or Insert into prim_residents
      const { data: resData, error: resError } = await supabase
        .from('prim_residents')
        .upsert({
          resident_key,
          resident_name: finalName,
          prims_used: parseInt(prims_used) || 0,
          prim_limit: limitToSet,
          casperlet_id: casperlet_id || null, // Link para a propriedade
          last_seen: new Date().toISOString()
        }, { onConflict: 'resident_key' })
        .select();

      if (resError) throw resError;

      // 4. Record in history if over limit
      const finalLimit = limitToSet;
      
      if (finalLimit > 0) {
        await supabase
          .from('prim_history')
          .insert({
            resident_key,
            resident_name: finalName,
            prims_used: parseInt(prims_used) || 0,
            prim_limit: finalLimit,
            over_limit: parseInt(prims_used) > finalLimit,
            recorded_at: new Date().toISOString()
          });
      }

      return res.status(200).send('OK - Sync Successful');
    } catch (err) {
      console.error('❌ PRIM SYNC ERROR:', err.message);
      return res.status(200).send(`ERROR: ${err.message}`);
    }
  });


  // 5. SECURITY SYSTEM ROUTES (Orb LSL Integration)
  app.post('/api/security/check', async (req, res) => {
    const payload = { ...req.query, ...req.body };
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const { parcel_id, avatar_key, avatar_name } = payload;

    console.log(`[Security-Check] Request: Parcel=${parcel_id}, Avatar=${avatar_name}, Key=${avatar_key}`);

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      // 1. Verify token and active status
      const { data: parcel, error: pError } = await supabase
        .from('security_parcels')
        .select('casperlet_id, is_active')
        .eq('orb_token', token)
        .single();

      if (pError || !parcel) {
        console.warn(`[Security-Check] Invalid token: ${token}`);
        return res.status(403).json({ allowed: false, role: 'invalid_token' });
      }

      if (!parcel.is_active) {
        return res.status(200).json({ allowed: true, role: 'system_disabled' });
      }
      
      // Ensure parcel_id matches the one linked to this token
      if (parcel.casperlet_id !== parcel_id) {
        console.warn(`[Security-Check] Parcel mismatch. Expected ${parcel.casperlet_id}, got ${parcel_id}`);
        return res.status(403).json({ allowed: false, role: 'wrong_parcel' });
      }

      // 2. Check Renters Table (Active Tenants)
      // We check if the name or key exists in the renters table
      const { data: isRenter } = await supabase
        .from('renters')
        .select('id')
        .or(`avatar_name.eq."${avatar_name}",avatar_uuid.eq."${avatar_key}"`)
        .maybeSingle();

      if (isRenter) {
        console.log(`[Security-Check] Allowed: ${avatar_name} is a registered resident (renters table)`);
        return res.status(200).json({ allowed: true, role: 'resident' });
      }

      // 3. Check Property Tenants (Direct Lease)
      // Check properties table for current tenant
      const { data: isTenant } = await supabase
        .from('properties')
        .select('id')
        .eq('casperlet_id', parcel_id)
        .or(`tenant_name.eq."${avatar_name}",tenant_id.eq."${avatar_key}"`)
        .maybeSingle();

      if (isTenant) {
        console.log(`[Security-Check] Allowed: ${avatar_name} is the current tenant of this parcel`);
        return res.status(200).json({ allowed: true, role: 'tenant' });
      }

      // 4. Check Access List (Guest List)
      const { data: access } = await supabase
        .from('security_access_list')
        .select('role')
        .eq('casperlet_id', parcel_id)
        .or(`avatar_name.eq."${avatar_name}",avatar_key.eq."${avatar_key}"`)
        .maybeSingle();

      if (access) {
        console.log(`[Security-Check] Allowed: ${avatar_name} is in the access list (${access.role})`);
        return res.status(200).json({ allowed: true, role: access.role });
      }

      // 5. Default Denied
      console.log(`[Security-Check] Denied: ${avatar_name}`);
      return res.status(200).json({ allowed: false, role: 'unknown' });
    } catch (err) {
      console.error('[Security-Check] Critical Error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/security/log', async (req, res) => {
    const payload = { ...req.query, ...req.body };
    const { parcel_id, avatar_key, avatar_name, action } = payload;

    console.log(`[Security-Log] Action: ${action} | Parcel: ${parcel_id} | Avatar: ${avatar_name}`);

    try {
      const { error } = await supabase.from('security_logs').insert({
        casperlet_id: parcel_id,
        avatar_key,
        avatar_name,
        action,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[Security-Log] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/security/config', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const { parcel_id } = req.query;

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const { data: parcel, error: pError } = await supabase
        .from('security_parcels')
        .select('is_active, radius, warn_time, ask_before')
        .eq('orb_token', token)
        .eq('casperlet_id', parcel_id)
        .single();

      if (pError || !parcel) return res.status(403).json({ error: 'Unauthorized' });
      return res.status(200).json(parcel);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Logging and Health routes
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });


  // Debug Route
  app.get('/api/webhooks/debug', (req, res) => {
    res.json({
      message: "Latest Webhook logs",
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
          tenant_name: tenant || "Available",
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
      res.status(404).send('Avatar not found');
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
