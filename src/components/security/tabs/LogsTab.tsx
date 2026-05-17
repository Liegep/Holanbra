import React, { useState, useEffect } from 'react';
import { ScrollText, MapPin, Search, AlertTriangle, ShieldCheck, UserMinus, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

interface LogsTabProps {
  selectedParcelId: string | null;
  properties: any[];
  onParcelSelect: (id: string) => void;
  residentUuid: string | null;
}

export function LogsTab({ selectedParcelId, properties, onParcelSelect, residentUuid }: LogsTabProps) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    if (!selectedParcelId || !residentUuid) return;
    setLoading(true);
    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logs',
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid
        })
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        setLogs(result.data);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    // Subscribe to new logs
    const channel = supabase
      .channel(`security_logs_${selectedParcelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'security_logs',
        filter: `casperlet_id=eq.${selectedParcelId}`
      }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedParcelId, residentUuid]);

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'allowed': return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: t('security.action_allowed') };
      case 'allowed_once': return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: t('security.action_allowed_once') };
      case 'added_access': return { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: t('security.action_added_access') };
      case 'manager_denied': return { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10', label: t('security.action_manager_denied') };
      case 'warned': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: t('security.action_warned') };
      case 'ejected': return { icon: UserMinus, color: 'text-orange-500', bg: 'bg-orange-500/10', label: t('security.action_ejected') };
      case 'banned': return { icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10', label: t('security.action_banned') };
      default: return { icon: ScrollText, color: 'text-zinc-500', bg: 'bg-zinc-500/10', label: action };
    }
  };

  const filteredLogs = logs.filter(l => 
    l.avatar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder={t('team.placeholder_name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[11px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-wider"
          />
        </div>
        <button
          onClick={() => loadLogs()}
          disabled={loading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <ScrollText size={12} className={cn(loading && "animate-spin")} />
          <span>{t('security.sync')}</span>
        </button>
      </div>

      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 animate-pulse rounded-lg" />
          ))
        ) : filteredLogs.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-white/10 uppercase font-black text-[10px] tracking-[0.3em] bg-white/[0.01]">
            {t('security.no_events')}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const info = getActionInfo(log.action);
            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", info.bg, info.color)}>
                    <info.icon size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[150px]">
                      {log.avatar_name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[7px] font-black uppercase tracking-widest", info.color)}>
                        {info.label}
                      </span>
                      <span className="text-[10px] text-white/10">•</span>
                      <span className="text-[7px] text-white/20 uppercase tracking-tighter">
                        {format(new Date(log.created_at), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[7px] text-white/20 font-mono tracking-tighter hidden sm:block uppercase">
                  {format(new Date(log.created_at), 'dd MMM')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
