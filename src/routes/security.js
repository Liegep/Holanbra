import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Client Supabase para uso interno
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper de validação de token
async function validateToken(token, parcelId) {
  const { data, error } = await supabase
    .from('security_parcels')
    .select('casperlet_id, active')
    .eq('orb_token', token)
    .single();
  
  if (error || !data || !data.active) return null;
  if (parcelId && data.casperlet_id !== parcelId) return null;
  return data;
}

// 1. security-check
router.post('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const { parcel_id, avatar_key, avatar_name } = req.body;
    
    if (!(await validateToken(token, parcel_id))) {
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
    
    if (!(await validateToken(token, parcel_id))) {
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

// 3. security-config
router.get('/config', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const parcel_id = req.query.parcel_id;
    
    if (!(await validateToken(token, parcel_id))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
      .from('security_parcels')
      .select('active, radius, warn_time, ask_before')
      .eq('casperlet_id', parcel_id)
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. security-access
router.post('/access', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const { parcel_id, action, avatar_key, avatar_name, role, reason } = req.body;
    
    if (!(await validateToken(token, parcel_id))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let result = { success: true };
    
    switch (action) {
      case 'add':
        await supabase.from('security_access_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, role: role || 'resident' });
        break;
      case 'remove':
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name);
        break;
      case 'add-manager':
        await supabase.from('security_access_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, role: 'manager' });
        break;
      case 'remove-manager':
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name).eq('role', 'manager');
        break;
      case 'list':
        const { data: list } = await supabase.from('security_access_list').select('*').eq('casperlet_id', parcel_id);
        result = list;
        break;
      case 'ban-list':
        const { data: bans } = await supabase.from('security_ban_list').select('*').eq('casperlet_id', parcel_id);
        result = bans;
        break;
      case 'manager-list':
        const { data: managers } = await supabase.from('security_access_list').select('*').eq('casperlet_id', parcel_id).eq('role', 'manager');
        result = managers;
        break;
      case 'ban':
        await supabase.from('security_ban_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, reason });
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_key', avatar_key);
        break;
      case 'unban':
        await supabase.from('security_ban_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name);
        break;
      default:
        throw new Error('Invalid action');
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
