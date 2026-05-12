import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();

// Client Supabase para uso interno
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper de validação de token (Orb Token)
async function validateOrbToken(token, parcelId) {
  const { data, error } = await supabase
    .from('security_parcels')
    .select('casperlet_id, active')
    .eq('orb_token', token)
    .single();
  
  if (error || !data || !data.active) return null;
  if (parcelId && data.casperlet_id !== parcelId) return null;
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
    
    if (!(await validateOrbToken(token, parcel_id))) {
      return res.status(401).json({ allowed: false, role: "unknown" });
    }

    // Verificar ban list
    const { data: banned } = await supabase
      .from('security_ban_list')
      .select('id')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle();

    if (banned) {
      return res.json({ allowed: false, role: "banned", avatar_key, avatar_name });
    }
    
    // Verificar access list
    const { data: access } = await supabase
      .from('security_access_list')
      .select('role')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle();
      
    if (access) {
      return res.json({ allowed: true, role: access.role, avatar_key, avatar_name });
    }

    return res.json({ allowed: false, role: "unknown", avatar_key, avatar_name });
  } catch (error) {
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
    const parcel_id = req.query.parcel_id;
    
    // GET: Aceita Orb ou Usuário
    let isOrbAuthorized = await validateOrbToken(token, parcel_id);
    let userAuth = null;
    if (!isOrbAuthorized) {
      userAuth = await validateUserAccess(token, parcel_id);
    }
    
    if (!isOrbAuthorized && !userAuth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
      .from('security_parcels')
      .select('active, radius, warn_time, ask_before, orb_token')
      .eq('casperlet_id', parcel_id)
      .maybeSingle();
        
    if (error) throw error;
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/config', async (req, res) => {
  try {
    const { parcel_id, active, resident_uuid } = req.body;
    
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
      .select('casperlet_id')
      .eq('casperlet_id', parcel_id)
      .maybeSingle();
      
    if (existing) {
      const { data, error } = await supabase
        .from('security_parcels')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('casperlet_id', parcel_id)
        .select()
        .single();
      if (error) throw error;
      updatedData = data;
    } else {
      const { data, error } = await supabase.from('security_parcels').insert({ 
        casperlet_id: parcel_id, 
        active: active, 
        radius: 20, 
        warn_time: 15, 
        ask_before: true,
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

export default router;
