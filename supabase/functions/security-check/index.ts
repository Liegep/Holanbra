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
    const { parcel_id, avatar_key, avatar_name } = await req.json()
    
    const parcel = await validateToken(supabase, token, parcel_id)
    if (!parcel) {
      return new Response(JSON.stringify({ allowed: false, role: "unknown" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Verificar ban list
    const { data: banned } = await supabase
      .from('security_ban_list')
      .select('id')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle()

    if (banned) {
      return new Response(JSON.stringify({ allowed: false, role: "banned", avatar_key, avatar_name }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 5. Verificar access list
    const { data: access } = await supabase
      .from('security_access_list')
      .select('role')
      .eq('casperlet_id', parcel_id)
      .eq('avatar_key', avatar_key)
      .maybeSingle()
      
    if (access) {
      return new Response(JSON.stringify({ allowed: true, role: access.role, avatar_key, avatar_name }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 6. Não encontrado
    return new Response(JSON.stringify({ allowed: false, role: "unknown", avatar_key, avatar_name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
