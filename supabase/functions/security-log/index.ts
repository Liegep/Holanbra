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
    const { parcel_id, avatar_key, avatar_name, action } = await req.json()
    
    const parcel = await validateToken(supabase, token, parcel_id)
    if (!parcel) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const { error: logError } = await supabase
      .from('security_logs')
      .insert({
        casperlet_id: parcel_id,
        avatar_key,
        avatar_name,
        action
      })
      
    if (logError) throw logError
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
