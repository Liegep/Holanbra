import React, { useState, useEffect } from 'react';
import { Power, MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface ParcelsTabProps {
  properties: any[];
}

export function ParcelsTab({ properties }: ParcelsTabProps) {
  const { t } = useTranslation();
  const [securityData, setSecurityData] = useState<Record<string, any>>({});
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function loadSecurityParcels() {
      const ids = properties.map(p => p.casperlet_id);
      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from('security_parcels')
        .select('*')
        .in('casperlet_id', ids);

      if (!error && data) {
        const mapped = data.reduce((acc: any, item: any) => {
          acc[item.casperlet_id] = item;
          return acc;
        }, {});
        setSecurityData(mapped);
      }
    }

    loadSecurityParcels();
  }, [properties]);

  const handleToggle = async (parcelId: string, currentStatus: boolean | undefined) => {
    setToggling(parcelId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (currentStatus === undefined) {
        // Create new record
        const { error } = await supabase
          .from('security_parcels')
          .insert({
            casperlet_id: parcelId,
            user_id: user.id,
            is_active: true,
            token: crypto.randomUUID()
          });
        
        if (!error) {
          // Re-fetch or update local state
          const { data } = await supabase.from('security_parcels').select('*').eq('casperlet_id', parcelId).single();
          if (data) setSecurityData(prev => ({ ...prev, [parcelId]: data }));
        }
      } else {
        // Toggle existing
        const { error } = await supabase
          .from('security_parcels')
          .update({ is_active: !currentStatus })
          .eq('casperlet_id', parcelId);

        if (!error) {
          setSecurityData(prev => ({
            ...prev,
            [parcelId]: { ...prev[parcelId], is_active: !currentStatus }
          }));
        }
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {properties.map((property) => {
        const security = securityData[property.casperlet_id];
        const isActive = security?.is_active;

        return (
          <div
            key={property.casperlet_id}
            className="p-5 bg-zinc-900 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 transition-colors",
              isActive ? "bg-emerald-500" : "bg-red-500"
            )} />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-tighter">
                    <MapPin size={10} />
                    {property.casperlet_id}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1">
                    {property.name}
                  </h3>
                </div>

                <div className={cn(
                  "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {isActive ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                  {isActive ? t('security.active') : t('security.inactive')}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button
                  disabled={toggling === property.casperlet_id}
                  onClick={() => handleToggle(property.casperlet_id, isActive)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100",
                    isActive
                      ? "bg-zinc-800 text-red-400 hover:bg-zinc-700"
                      : "bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/10"
                  )}
                >
                  <Power size={14} className={cn(toggling === property.casperlet_id && "animate-pulse")} />
                  {isActive ? t('security.deactivate') : t('security.activate')}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
