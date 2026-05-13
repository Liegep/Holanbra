import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();

// Client Supabase para uso interno
const supabaseUrl = process.env.SUPABASE_URL || 'https://kwosiiddjwkajvatgudp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b3NpaWRkandrYWp2YXRndWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTgwMDgsImV4cCI6MjA5MzAzNDAwOH0.33En7oofSwpWDK-lScNDCob98kBJCFGstMbAU-wGvZg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper de validação de token (Orb Token)
async function validateOrbToken(token, parcelId) {
  const { data, error } = await supabase
    .from('security_parcels')
    .select('casperlet_id, active, orb_token')
    .eq('orb_token', token)
    .single();
  
  if (error) {
    console.log('[security/validateOrbToken] Error:', error.message, { token, parcelId });
    return null;
  }
  if (!data || !data.active) {
    console.log('[security/validateOrbToken] Inactive or missing parcel', { token, parcelId, active: data?.active });
    return null;
  }
  if (parcelId && data.casperlet_id !== parcelId) {
    console.log('[security/validateOrbToken] Parcel ID mismatch', { expected: data.casperlet_id, received: parcelId });
    return null;
  }
  return data;
}

// Helper para validar usuário logado (via Auth Token)
async function validateUserAccess(token, parcelId) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Verificar se o usuário tem acesso à property (casperlet_id)
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('id, tenant_id')
    .eq('casperlet_id', parcelId)
    .single();

  if (propError || !property) return null;
  
  if (property.tenant_id === user.id) return { userId: user.id };
  
  // Verifique property_tenants
  const { data: tenant } = await supabase
    .from('property_tenants')
    .select('id')
    .eq('property_id', property.id)
    .eq('tenant_id', user.id)
    .maybeSingle();
    
  if (tenant) return { userId: user.id };
  
  return null;
}

// 1. security-check
router.post('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const { parcel_id, avatar_key, avatar_name } = req.body;
    
    const orbParcel = await validateOrbToken(token, parcel_id);
    if (!orbParcel) {
      console.log('[security/check] Unauthorized token/parcel', { parcel_id, token: token ? 'provided' : 'missing' });
      return res.status(401).json({ allowed: false, role: "unauthorized" });
    }

    // 1. Verificar ban list primeiro
    const { data: banned, error: banError } = await supabase
      .from('security_ban_list')
      .select('id, reason')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle();

    if (banned) {
      console.log('[security/check] Banned found', { parcel_id, avatar_key, avatar_name });
      return res.json({ allowed: false, role: "banned", avatar_key, avatar_name, reason: banned.reason });
    }
    
    // 2. Se não estiver banido, verificar access list
    const { data: access, error: accError } = await supabase
      .from('security_access_list')
      .select('role, avatar_name, avatar_key')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle();
      
    console.log('[security/check] Verification results', { 
      parcel_id, 
      avatar_key, 
      avatar_name,
      banned: !!banned, 
      access: !!access, 
      role: access?.role 
    });

    if (access) {
      return res.json({ allowed: true, role: access.role, avatar_key: access.avatar_key || avatar_key, avatar_name: access.avatar_name || avatar_name });
    }

    // 3. Só retornar allowed:false se não houver ban nem access
    return res.json({ allowed: false, role: "none", avatar_key, avatar_name });
  } catch (error) {
    console.error('[security/check] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. security-log
router.post('/log', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const { parcel_id, avatar_key, avatar_name, action } = req.body;
    
    if (!(await validateOrbToken(token, parcel_id))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { error } = await supabase
      .from('security_logs')
      .insert({ casperlet_id: parcel_id, avatar_key, avatar_name, action });
      
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. security-config (GET to read, POST to update)
router.get('/config', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const parcel_id = String(req.query.parcel_id || '');

    const { data: row, error } = await supabase
      .from('security_parcels')
      .select('casperlet_id, orb_token, active, radius, warn_time, ask_before')
      .eq('casperlet_id', parcel_id)
      .eq('orb_token', token)
      .maybeSingle();

    console.log('[ORB CONFIG GET]', {
      parcel_id,
      token_prefix: token.slice(0, 10),
      error,
      row
    });

    if (error || !row) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({
      active: row.active === true,
      radius: Number(row.radius ?? 20),
      warn_time: Number(row.warn_time ?? 15),
      ask_before: row.ask_before === true,
      orb_token: row.orb_token
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/config', async (req, res) => {
  try {
    const { action, parcel_id, active, radius, warn_time, ask_before, resident_uuid } = req.body;
    
    if (!resident_uuid) {
      return res.status(401).json({ error: 'Forbidden: Missing resident_uuid' });
    }
    
    // 1. Verificar se existe renter com avatar_uuid = resident_uuid
    const { data: renter, error: renterError } = await supabase
      .from('renters')
      .select('avatar_uuid')
      .eq('avatar_uuid', resident_uuid)
      .maybeSingle();
      
    if (renterError || !renter) {
      return res.status(403).json({ error: 'Forbidden: Invalid Renter' });
    }
    
    // 2. Verificar property por casperlet_id = parcel_id e tenant_id = resident_uuid
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('casperlet_id', parcel_id)
      .eq('tenant_id', resident_uuid)
      .maybeSingle();
      
    if (propError || !property) {
      return res.status(403).json({ error: 'Forbidden: Property access denied' });
    }
    
    let updatedData = null;
    
    const { data: existing } = await supabase
      .from('security_parcels')
      .select('casperlet_id, active')
      .eq('casperlet_id', parcel_id)
      .maybeSingle();
      
    const updatePayload = {
      updated_at: new Date().toISOString()
    };

    if (action === 'toggle') {
      if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'active boolean required for toggle' });
      }
      updatePayload.active = active;
    } else if (action === 'settings') {
      if (typeof radius === 'number' && !Number.isNaN(radius)) {
        updatePayload.radius = radius;
      }
      if (typeof warn_time === 'number' && !Number.isNaN(warn_time)) {
        updatePayload.warn_time = warn_time;
      }
      if (typeof ask_before === 'boolean') {
        updatePayload.ask_before = ask_before;
      }
    } else {
      // Por compatibilidade se não vier action, mas vier active ou settings
      // Mas a regra diz: só trocar active se action === 'toggle'
      if (typeof radius === 'number' && !Number.isNaN(radius)) {
        updatePayload.radius = radius;
      }
      if (typeof warn_time === 'number' && !Number.isNaN(warn_time)) {
        updatePayload.warn_time = warn_time;
      }
      if (typeof ask_before === 'boolean') {
        updatePayload.ask_before = ask_before;
      }
      // Se não houver action explícita, NÃO mudamos active.
    }

    if (existing) {
      const { data, error } = await supabase
        .from('security_parcels')
        .update(updatePayload)
        .eq('casperlet_id', parcel_id)
        .select()
        .single();
      if (error) throw error;
      updatedData = data;
    } else {
      const { data, error } = await supabase.from('security_parcels').insert({ 
        casperlet_id: parcel_id, 
        active: action === 'toggle' ? active : true, // Padrão on se for primeira config via settings
        radius: typeof radius === 'number' ? radius : 20, 
        warn_time: typeof warn_time === 'number' ? warn_time : 15, 
        ask_before: typeof ask_before === 'boolean' ? ask_before : true,
        orb_token: crypto.randomUUID()
      }).select().single();
      if (error) throw error;
      updatedData = data;
    }
    
    res.json({ success: true, data: updatedData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function accessActionHandler(req, res) {
  try {
    const { action, parcel_id, resident_uuid, avatar_name, avatar_key, role, reason } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') ?? '';
    
    let isAuthorized = false;
    let authType = null; // 'web' or 'orb'

    // 1. Verificar se é fluxo do painel web (resident_uuid)
    if (resident_uuid) {
      // Validar renter
      const { data: renter, error: renterError } = await supabase
        .from('renters')
        .select('avatar_uuid')
        .eq('avatar_uuid', resident_uuid)
        .maybeSingle();
        
      if (!renterError && renter) {
        // Validar property para ações que exigem vínculo
        const needsPropertyCheck = ['add', 'ban', 'remove', 'unban', 'logs', 'add-manager', 'remove-manager', 'list', 'access-list', 'ban-list', 'manager-list'].includes(action);
        
        if (parcel_id && needsPropertyCheck) {
          const { data: property, error: propError } = await supabase
            .from('properties')
            .select('id')
            .eq('casperlet_id', parcel_id)
            .eq('tenant_id', resident_uuid)
            .maybeSingle();
          
          if (property && !propError) {
            isAuthorized = true;
            authType = 'web';
          }
        } else if (action === 'status') {
          // Status lida com múltiplos IDs, validação interna
          isAuthorized = true;
          authType = 'web';
        }
      }
    } 
    
    // 2. Se não autorizado via web, tentar orb_token
    if (!isAuthorized && token) {
      const orbData = await validateOrbToken(token, parcel_id);
      if (orbData) {
        isAuthorized = true;
        authType = 'orb';
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // LISTAGENS
    if (action === 'list' || action === 'access-list') {
      const { data, error } = await supabase
        .from('security_access_list')
        .select('*')
        .eq('casperlet_id', parcel_id)
        .order('created_at', { ascending: false });
      
      console.log('[security/access list]', { parcel_id, resident_uuid, count: data?.length, error: error?.message });
      
      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (action === 'ban-list') {
      const { data, error } = await supabase
        .from('security_ban_list')
        .select('*')
        .eq('casperlet_id', parcel_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (action === 'manager-list') {
      const { data, error } = await supabase
        .from('security_access_list')
        .select('*')
        .eq('casperlet_id', parcel_id)
        .eq('role', 'manager')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data });
    }

    // AÇÕES DE ESCRITA
    if (action === 'add' || action === 'add-manager') {
      const finalRole = action === 'add-manager' ? 'manager' : (role || 'resident');
      
      const payload = {
        casperlet_id: parcel_id,
        avatar_name,
        avatar_key: avatar_key || null,
        role: finalRole
      };

      // Tentar upsert se houver key, senão apenas insert
      let result;
      if (avatar_key) {
        result = await supabase
          .from('security_access_list')
          .upsert(payload, { onConflict: 'casperlet_id,avatar_key' })
          .select()
          .single();
      } else {
        result = await supabase
          .from('security_access_list')
          .insert(payload)
          .select()
          .single();
      }
      
      // Ignorar erro de duplicidade se for o caso
      if (result.error) {
        if (result.error.code === '23505') {
          const query = supabase
            .from('security_access_list')
            .select('*')
            .eq('casperlet_id', parcel_id);
          
          if (avatar_key) query.eq('avatar_key', avatar_key);
          else query.eq('avatar_name', avatar_name);
          
          const { data } = await query.single();
          result.data = data;
        } else {
          throw result.error;
        }
      }
      
      // Remover da security_ban_list se existir
      const banQuery = supabase.from('security_ban_list').delete().eq('casperlet_id', parcel_id);
      if (avatar_key) banQuery.eq('avatar_key', avatar_key);
      else banQuery.eq('avatar_name', avatar_name);
      await banQuery;

      return res.json({ success: true, data: result.data });
    }

    if (action === 'remove' || action === 'remove-manager') {
      const query = supabase
        .from('security_access_list')
        .delete()
        .eq('casperlet_id', parcel_id);
      
      if (avatar_key) query.eq('avatar_key', avatar_key);
      else if (avatar_name) query.eq('avatar_name', avatar_name);
      else return res.status(400).json({ error: 'avatar_key or avatar_name required' });

      if (action === 'remove-manager') query.eq('role', 'manager');

      const { error } = await query;
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === 'ban') {
      const { data, error } = await supabase
        .from('security_ban_list')
        .insert({
          casperlet_id: parcel_id,
          avatar_name,
          avatar_key: avatar_key || null,
          reason: reason || ''
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const delQuery = supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id);
      if (avatar_key) delQuery.eq('avatar_key', avatar_key);
      else delQuery.eq('avatar_name', avatar_name);
      await delQuery;
        
      return res.json({ success: true, data });
    }

    if (action === 'unban') {
      const query = supabase.from('security_ban_list').delete().eq('casperlet_id', parcel_id);
      if (avatar_key) query.eq('avatar_key', avatar_key);
      else query.eq('avatar_name', avatar_name);
      
      const { error } = await query;
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === 'logs') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('casperlet_id', parcel_id)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (action === 'status' && authType === 'web') {
      const { parcel_ids } = req.body;
      if (!parcel_ids || !Array.isArray(parcel_ids)) {
        return res.status(400).json({ error: 'parcel_ids array required' });
      }

      const { data: properties } = await supabase
        .from('properties')
        .select('casperlet_id')
        .eq('tenant_id', resident_uuid)
        .in('casperlet_id', parcel_ids);

      if (!properties || properties.length === 0) {
        return res.json({ success: true, data: [] });
      }

      const authorizedIds = properties.map(p => p.casperlet_id);
      const { data: securityRecords, error: secError } = await supabase
        .from('security_parcels')
        .select('*')
        .in('casperlet_id', authorizedIds);

      if (secError) throw secError;
      return res.json({ success: true, data: securityRecords });
    }

    return res.status(400).json({ error: 'Invalid action or missing parameters' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

router.post('/access', accessActionHandler);

// COMPATIBILIDADE LSL
router.post('/access/add', (req, res) => {
  req.body.action = 'add';
  accessActionHandler(req, res);
});

router.post('/access/remove', (req, res) => {
  req.body.action = 'remove';
  accessActionHandler(req, res);
});

router.post('/access/remove-manager', (req, res) => {
  req.body.action = 'remove-manager';
  accessActionHandler(req, res);
});

router.get('/access/list', (req, res) => {
  req.body = { ...req.body, action: 'list', parcel_id: req.query.parcel_id };
  accessActionHandler(req, res);
});

router.get('/ban/list', (req, res) => {
  req.body = { ...req.body, action: 'ban-list', parcel_id: req.query.parcel_id };
  accessActionHandler(req, res);
});

router.get('/managers', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const parcel_id = String(req.query.parcel_id || '');

    const { data: parcel, error: parcelError } = await supabase
      .from('security_parcels')
      .select('casperlet_id')
      .eq('casperlet_id', parcel_id)
      .eq('orb_token', token)
      .maybeSingle();

    if (parcelError || !parcel) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const { data, error } = await supabase
      .from('security_access_list')
      .select('avatar_key, avatar_name, role')
      .eq('casperlet_id', parcel_id)
      .eq('role', 'manager');

    if (error) throw error;

    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
