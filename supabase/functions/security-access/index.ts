import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function validateToken(supabase: any, token: string, parcelId: string) {
  const { data, error } = await supabase
    .from('security_parcels')
    .select('casperlet_id, active')
    .eq('orb_token', token)
    .single()
  
  if (error || !data || !data.active) return null
  if (parcelId && data.casperlet_id !== parcelId) return null
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const body = await req.json()
    const { parcel_id, action, avatar_key, avatar_name, role, reason } = body
    
    const parcel = await validateToken(supabase, token, parcel_id)
    if (!parcel) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    let result: any = { success: true }
    
    switch (action) {
      case 'add':
        await supabase.from('security_access_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, role: role || 'resident' })
        break
      case 'remove':
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name)
        break
      case 'add-manager':
        await supabase.from('security_access_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, role: 'manager' })
        break
      case 'remove-manager':
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name).eq('role', 'manager')
        break
      case 'list':
        const { data: list } = await supabase.from('security_access_list').select('*').eq('casperlet_id', parcel_id)
        result = list
        break
      case 'ban-list':
        const { data: bans } = await supabase.from('security_ban_list').select('*').eq('casperlet_id', parcel_id)
        result = bans
        break
      case 'manager-list':
        const { data: managers } = await supabase.from('security_access_list').select('*').eq('casperlet_id', parcel_id).eq('role', 'manager')
        result = managers
        break
      case 'ban':
        await supabase.from('security_ban_list').insert({ casperlet_id: parcel_id, avatar_key, avatar_name, reason })
        await supabase.from('security_access_list').delete().eq('casperlet_id', parcel_id).eq('avatar_key', avatar_key)
        break
      case 'unban':
        await supabase.from('security_ban_list').delete().eq('casperlet_id', parcel_id).eq('avatar_name', avatar_name)
        break
      default:
        throw new Error('Invalid action')
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
