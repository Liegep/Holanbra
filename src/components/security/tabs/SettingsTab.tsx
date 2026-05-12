import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Copy, RefreshCw, Save, CheckCircle2, AlertCircle, Trash2, ShieldAlert, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface SettingsTabProps {
  selectedParcelId: string | null;
  properties: any[];
  onParcelSelect: (id: string) => void;
  residentUuid?: string;
  currentSecurity?: any;
}

export function SettingsTab({ selectedParcelId, properties, onParcelSelect, residentUuid, currentSecurity }: SettingsTabProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmRegen, setShowConfirmRegen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (!selectedParcelId) return;

    async function loadConfig() {
      setLoading(true);
      
      // Prefer prop data if available and matches selected parcel
      if (currentSecurity && currentSecurity.casperlet_id === selectedParcelId) {
        setConfig(currentSecurity);
      } else if (residentUuid) {
        // Fetch via API for proper renter access
        try {
          const response = await fetch('/api/security/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: "status",
              resident_uuid: residentUuid,
              parcel_ids: [selectedParcelId]
            })
          });
          const result = await response.json();
          if (response.ok && result.success && result.data.length > 0) {
            setConfig(result.data[0]);
          }
        } catch (err) {
          console.error("Error loading config:", err);
        }
      }

      // Managers still loaded from access list (if RLS allows)
      const { data: managersData } = await supabase
        .from('security_access_list')
        .select('*')
        .eq('casperlet_id', selectedParcelId)
        .eq('role', 'manager');

      if (managersData) setManagers(managersData);
      setLoading(false);
    }

    loadConfig();
  }, [selectedParcelId, residentUuid, currentSecurity]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId || !config) return;

    setSaving(true);
    const { error } = await supabase
      .from('security_parcels')
      .update({
        radius: config.radius,
        warn_time: config.warn_time,
        ask_before_eject: config.ask_before_eject
      })
      .eq('casperlet_id', selectedParcelId);

    setSaving(false);
  };

  const handleClearAll = async () => {
    if (!selectedParcelId) return;
    setClearing(true);
    
    // Clear access list
    await supabase.from('security_access_list').delete().eq('casperlet_id', selectedParcelId);
    // Clear ban list
    await supabase.from('security_ban_list').delete().eq('casperlet_id', selectedParcelId);
    
    setClearing(false);
    setShowConfirmClear(false);
  };

  const timerPresets = [0, 10, 20, 30];

  const regenerateToken = async () => {
    if (!selectedParcelId) return;
    const newToken = crypto.randomUUID();
    const { error } = await supabase
      .from('security_parcels')
      .update({ orb_token: newToken })
      .eq('casperlet_id', selectedParcelId);

    if (!error) {
      setConfig(prev => ({ ...prev, orb_token: newToken }));
      setShowConfirmRegen(false);
    }
  };

  const copyToClipboard = () => {
    if (!config?.orb_token) return;
    navigator.clipboard.writeText(config.orb_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedParcelId) return null;

  return (
    <div className="space-y-8">
      {/* Parcel Selector */}
      <div className="flex flex-wrap gap-2">
        {properties.map(p => (
          <button
            key={p.casperlet_id}
            onClick={() => onParcelSelect(p.casperlet_id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
              selectedParcelId === p.casperlet_id
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/5 text-white/30 hover:text-white/50"
            )}
          >
            <MapPin size={10} />
            {p.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-24 bg-white/5 animate-pulse rounded-2xl" />
          <div className="h-48 bg-white/5 animate-pulse rounded-2xl" />
        </div>
      ) : !config ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-white/20 gap-8 bg-white/[0.01]">
          <div className="relative">
            <Shield size={64} className="opacity-10" />
            <AlertCircle size={24} className="absolute -top-2 -right-2 text-amber-500 animate-pulse" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="uppercase font-black text-[12px] tracking-[0.5em] text-white/60">
              {t('security.system_offline', 'Security System Offline')}
            </h3>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold max-w-xs leading-relaxed">
              Activate the main console in the Terminal tab to configure regional security rules.
            </p>
            <button
               onClick={() => onParcelSelect(selectedParcelId)}
               className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-amber-500 hover:border-amber-500/20 transition-all active:scale-95"
            >
               Retry Link
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Orb Connection */}
          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <RefreshCw size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{t('security.copy_token')}</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-white/60 select-all truncate">
                {config.orb_token}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 bg-amber-500 text-black hover:bg-amber-600 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <button
              onClick={() => setShowConfirmRegen(true)}
              className="text-[9px] text-white/20 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <RefreshCw size={12} />
              {t('security.regenerate_token')}
            </button>
          </div>

          {/* Form Settings */}
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                  {t('security.radius')}
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={config.radius}
                    onChange={e => setConfig({ ...config, radius: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase">Meters</div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1 flex justify-between">
                  {t('security.timer_label')}
                  <span className="text-amber-500 font-mono">{config.warn_time}s</span>
                </label>
                <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                  {timerPresets.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setConfig({ ...config, warn_time: t })}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black transition-all",
                        config.warn_time === t
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                          : "text-white/20 hover:text-white/40 hover:bg-white/5"
                      )}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                {t('security.managers_display')}
              </label>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-wrap gap-2 min-h-[60px]">
                {managers.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-[9px] text-white/10 uppercase font-black tracking-widest">
                    {t('security.no_managers')}
                  </div>
                ) : (
                  managers.map((m) => (
                    <div key={m.id} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Shield size={10} />
                      {m.avatar_name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="flex-[0.4] py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                {t('security.clear_all_lists')}
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <Save size={16} />}
                {t('security.save')}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Clear All Confirmation */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-500/40 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/5 pulse">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-lg">{t('security.system_purge')}</h3>
              <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold px-4">
                {t('security.purge_desc')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="w-full py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                {t('security.execute_purge')}
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="w-full py-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:text-white"
              >
                {t('security.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regen Confirmation */}
      {showConfirmRegen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-900 border border-red-500/20 rounded-3xl p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-red-500/20">
              <RefreshCw size={32} className="animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">{t('security.regenerate_token')}</h3>
              <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold px-4">
                {t('security.warn_regenerate')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmRegen(false)}
                className="flex-1 py-3 px-4 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-700"
              >
                {t('security.cancel')}
              </button>
              <button
                onClick={regenerateToken}
                className="flex-1 py-3 px-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20"
              >
                {t('security.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
