import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Copy, RefreshCw, Save, CheckCircle2, AlertCircle, Trash2, ShieldAlert, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import Toast, { ToastType } from '../../Toast';

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
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

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

      // Also try to load managers via API if direct fetch is empty or as preferred method
      if (residentUuid) {
        try {
          const mResponse = await fetch('/api/security/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: "manager-list",
              parcel_id: selectedParcelId,
              resident_uuid: residentUuid
            })
          });
          const mResult = await mResponse.json();
          if (mResponse.ok && mResult.success) {
            setManagers(mResult.data);
          }
        } catch (err) {
          console.error("Error loading managers:", err);
        }
      }
      
      setLoading(false);
    }

    loadConfig();
  }, [selectedParcelId, residentUuid, currentSecurity]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId || !config || !residentUuid) return;

    setSaving(true);
    try {
      const response = await fetch('/api/security/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'settings',
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid,
          radius: Number(config.radius),
          warn_time: Number(config.warn_time),
          ask_before: Boolean(config.ask_before)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setConfig(result.data);
        showToast('Settings saved successfully');
      }
    } catch (err) {
      console.error('Error saving security settings:', err);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!selectedParcelId) return;
    setClearing(true);
    
    // Clear access list (excluding managers)
    await supabase.from('security_access_list').delete().eq('casperlet_id', selectedParcelId).neq('role', 'manager');
    // Clear ban list
    await supabase.from('security_ban_list').delete().eq('casperlet_id', selectedParcelId);
    
    showToast('All lists cleared successfully');
    setClearing(false);
    setShowConfirmClear(false);
  };

  const timerPresets = [0, 10, 20, 30];

  const regenerateToken = async () => {
    if (!selectedParcelId || !residentUuid) return;
    
    try {
      const response = await fetch('/api/security/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setConfig(result.data);
        setShowConfirmRegen(false);
        showToast('Token regenerated successfully');
      } else {
        throw new Error(result.error || 'Failed to regenerate token');
      }
    } catch (err) {
      console.error('Error regenerating token:', err);
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
    <div className="space-y-4 pt-1">

      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-white/5 animate-pulse rounded-xl" />
          <div className="h-40 bg-white/5 animate-pulse rounded-xl" />
        </div>
      ) : !config ? (
        <div className="h-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/20 gap-4 bg-white/[0.01]">
          <Shield size={32} className="opacity-10" />
          <div className="text-center space-y-2">
            <h3 className="uppercase font-black text-[10px] tracking-[0.3em] text-white/60">
              {t('security.system_offline', 'Security System Offline')}
            </h3>
            <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold max-w-xs leading-relaxed">
              Activate the main console in the Terminal tab.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Orb Connection - Compact */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <RefreshCw size={12} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">{t('security.copy_token')}</h3>
              </div>
              <button
                onClick={() => setShowConfirmRegen(true)}
                className="text-[8px] text-white/20 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <RefreshCw size={10} />
                {t('security.regenerate_button', 'Regenerate')}
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-black/40 border border-white/5 rounded-lg font-mono text-[9px] text-white/60 select-all truncate">
                {config.orb_token}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-3 bg-amber-500 text-black hover:bg-amber-600 rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Form Settings - Compact */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 uppercase font-black tracking-widest px-1">
                  {t('security.radius')}
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={config.radius}
                    onChange={e => setConfig({ ...config, radius: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/20 uppercase">{t('security.meters', 'Meters')}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 uppercase font-black tracking-widest px-1 flex justify-between">
                  {t('security.timer_label')}
                  <span className="text-amber-500 font-mono">{config.warn_time}s</span>
                </label>
                <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  {timerPresets.map((tP) => (
                    <button
                      key={tP}
                      type="button"
                      onClick={() => setConfig({ 
                        ...config, 
                        warn_time: tP
                      })}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                        config.warn_time === tP
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                          : "text-white/20 hover:text-white/40 hover:bg-white/5"
                      )}
                    >
                      {tP}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] text-white font-black uppercase tracking-wider">
                  {t('security.ask_manager_before', 'ASK MANAGER BEFORE EJECTING')}
                </div>
                <div className="text-[8px] text-white/20 uppercase font-bold tracking-tight">
                  {t('security.ask_manager_before_desc', 'SEND APPROVAL POPUP TO MANAGERS')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, ask_before: !config.ask_before })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300",
                  config.ask_before ? "bg-amber-500" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-black rounded-full transition-all duration-300",
                  config.ask_before ? "left-5.5" : "left-0.5"
                )} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-widest px-1">
                {t('security.managers_display', 'Managers')}
              </label>
              <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-wrap gap-1.5 min-h-[40px]">
                {managers.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-white/10 uppercase font-black tracking-widest py-2">
                    {t('security.no_managers', 'No managers added')}
                  </div>
                ) : (
                  managers.map((m) => (
                    <div key={m.id} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[8px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5 group relative">
                      <Shield size={8} />
                      {m.avatar_name}
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/5">
                        {m.avatar_key}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="flex-[0.4] py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('security.purge_button', 'Purge')}
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <Save size={14} />}
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

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
