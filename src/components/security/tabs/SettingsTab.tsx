import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Copy, RefreshCw, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface SettingsTabProps {
  selectedParcelId: string | null;
  properties: any[];
  onParcelSelect: (id: string) => void;
}

export function SettingsTab({ selectedParcelId, properties, onParcelSelect }: SettingsTabProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmRegen, setShowConfirmRegen] = useState(false);

  useEffect(() => {
    if (!selectedParcelId) return;

    async function loadConfig() {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_parcels')
        .select('*')
        .eq('casperlet_id', selectedParcelId)
        .single();

      if (!error && data) setConfig(data);
      setLoading(false);
    }

    loadConfig();
  }, [selectedParcelId]);

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

  const regenerateToken = async () => {
    if (!selectedParcelId) return;
    const newToken = crypto.randomUUID();
    const { error } = await supabase
      .from('security_parcels')
      .update({ token: newToken })
      .eq('casperlet_id', selectedParcelId);

    if (!error) {
      setConfig(prev => ({ ...prev, token: newToken }));
      setShowConfirmRegen(false);
    }
  };

  const copyToClipboard = () => {
    if (!config?.token) return;
    navigator.clipboard.writeText(config.token);
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
        <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/20 gap-4">
          <AlertCircle size={32} />
          <p className="uppercase font-black text-[10px] tracking-[0.3em]">
            {t('security.inactive')}
          </p>
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
                {config.token}
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
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                  {t('security.radius')}
                </label>
                <input
                  type="number"
                  value={config.radius}
                  onChange={e => setConfig({ ...config, radius: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                  {t('security.warn_time')}
                </label>
                <input
                  type="number"
                  value={config.warn_time}
                  onChange={e => setConfig({ ...config, warn_time: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl cursor-pointer transition-all group">
              <div className={cn(
                "w-10 h-6 rounded-full relative transition-colors",
                config.ask_before_eject ? "bg-amber-500" : "bg-zinc-700"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  config.ask_before_eject ? "right-1" : "left-1"
                )} />
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={config.ask_before_eject}
                onChange={e => setConfig({ ...config, ask_before_eject: e.target.checked })}
              />
              <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-white tracking-widest transition-colors">
                {t('security.ask_before')}
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? t('common.save') : t('security.save')}
            </button>
          </form>
        </>
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
