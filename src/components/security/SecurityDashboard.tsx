import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Ban, ScrollText, Settings, LayoutGrid, Power, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// Import Tabs
import { ParcelsTab } from './tabs/ParcelsTab';
import { AccessListTab } from './tabs/AccessListTab';
import { BanListTab } from './tabs/BanListTab';
import { LogsTab } from './tabs/LogsTab';
import { SettingsTab } from './tabs/SettingsTab';

interface SecurityDashboardProps {
  onClose: () => void;
}

export function SecurityDashboard({ onClose }: SecurityDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'access' | 'ban' | 'logs' | 'settings'>('dashboard');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [selectedParcelName, setSelectedParcelName] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<Record<string, any>>({});
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('casperlet_id, name')
        .eq('user_id', user.id);

      if (!error && data) {
        setProperties(data);
        if (data.length > 0) {
          setSelectedParcelId(data[0].casperlet_id);
          setSelectedParcelName(data[0].name);
          loadSecurityParcels(data.map((p: any) => p.casperlet_id));
        }
      }
      setLoading(false);
    }

    async function loadSecurityParcels(ids: string[]) {
      if (ids.length === 0) return;
      const { data } = await supabase
        .from('security_parcels')
        .select('*')
        .in('casperlet_id', ids);

      if (data) {
        const mapped = data.reduce((acc: any, item: any) => {
          acc[item.casperlet_id] = item;
          return acc;
        }, {});
        setSecurityData(mapped);
      }
    }

    loadProperties();
  }, []);

  const handleToggle = async (parcelId: string) => {
    const security = securityData[parcelId];
    const isActive = security?.is_active;
    setToggling(parcelId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!security) {
        // Create new
        const { error } = await supabase.from('security_parcels').insert({
          casperlet_id: parcelId,
          user_id: user.id,
          is_active: true,
          token: crypto.randomUUID()
        });
        if (!error) {
          const { data } = await supabase.from('security_parcels').select('*').eq('casperlet_id', parcelId).single();
          if (data) setSecurityData(prev => ({ ...prev, [parcelId]: data }));
        }
      } else {
        // Update
        const { error } = await supabase
          .from('security_parcels')
          .update({ is_active: !isActive })
          .eq('casperlet_id', parcelId);
        if (!error) {
          setSecurityData(prev => ({
            ...prev,
            [parcelId]: { ...prev[parcelId], is_active: !isActive }
          }));
        }
      }
    } finally {
      setToggling(null);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'access', label: t('security.access_list'), icon: Users },
    { id: 'ban', label: t('security.ban_list'), icon: Ban },
    { id: 'logs', label: t('security.event_log'), icon: ScrollText },
    { id: 'settings', label: t('security.settings'), icon: Settings },
  ] as const;

  const currentSecurity = selectedParcelId ? securityData[selectedParcelId] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-zinc-950/50 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] backdrop-blur-2xl"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20 shadow-inner">
              <Shield size={24} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-[0.3em] text-white">
                {t('security.title')}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20" />
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  System Online · {selectedParcelName || 'Terminal'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all group border border-white/5"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Parcel Quick Selector */}
        <div className="flex gap-2 p-2 px-6 bg-black/40 overflow-x-auto no-scrollbar">
          {properties.map(p => (
            <button
              key={p.casperlet_id}
              onClick={() => {
                setSelectedParcelId(p.casperlet_id);
                setSelectedParcelName(p.name);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                selectedParcelId === p.casperlet_id
                  ? "bg-white/10 border-white/20 text-white shadow-lg"
                  : "bg-transparent border-transparent text-white/20 hover:text-white/40"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Navigation Tabs - Glass Style */}
        <div className="flex p-2 gap-2 bg-black/20 border-b border-white/5">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all group",
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white shadow-inner border border-white/10"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              )}
            >
              <tab.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "text-amber-500" : "text-white/20")} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Region */}
        <div className="flex-1 overflow-y-auto min-h-0 p-8 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin" />
                <Shield className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={24} />
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">
                Encrypting Connection...
              </p>
            </div>
          ) : (
            <motion.div
              key={activeTab + (selectedParcelId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && selectedParcelId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-start">
                  {/* MAIN ON/OFF BUTTON - GLASSMORPHISM */}
                  <button
                    onClick={() => handleToggle(selectedParcelId)}
                    disabled={toggling === selectedParcelId}
                    className={cn(
                      "col-span-1 md:col-span-2 group relative p-12 rounded-[2.5rem] border transition-all overflow-hidden flex flex-col items-center justify-center gap-6",
                      currentSecurity?.is_active
                        ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                        : "bg-red-500/10 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                    )}
                  >
                    {/* Animated background glow */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]",
                      currentSecurity?.is_active ? "bg-emerald-500/20" : "bg-red-500/20"
                    )} />
                    
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                      currentSecurity?.is_active 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-110" 
                        : "bg-zinc-800 text-white/20 scale-100"
                    )}>
                      <Power size={40} className={cn(toggling === selectedParcelId && "animate-spin")} />
                    </div>

                    <div className="text-center relative z-10">
                      <h3 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-2">
                        {currentSecurity?.is_active ? 'ENABLED' : 'DISABLED'}
                      </h3>
                      <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">
                        {currentSecurity?.is_active ? 'Security Active in Region' : 'Automatic Defense Offline'}
                      </p>
                    </div>
                  </button>

                  {/* Navigation Cards */}
                  {[
                    { id: 'access', label: t('security.access_list'), icon: Users, color: 'blue', desc: 'White-list Management' },
                    { id: 'ban', label: t('security.ban_list'), icon: Ban, color: 'red', desc: 'Active Trespasser Block' },
                    { id: 'logs', label: t('security.event_log'), icon: ScrollText, color: 'amber', desc: 'Recent Security Incidents' },
                    { id: 'settings', label: t('security.settings'), icon: Settings, color: 'zinc', desc: 'Calibration & Reset' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className="group relative p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all flex flex-col items-start gap-4 text-left overflow-hidden"
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                        item.color === 'blue' && "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20",
                        item.color === 'red' && "bg-red-500/10 text-red-500 ring-1 ring-red-500/20",
                        item.color === 'amber' && "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20",
                        item.color === 'zinc' && "bg-zinc-500/10 text-zinc-500 ring-1 ring-zinc-500/20"
                      )}>
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{item.label}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mt-1">{item.desc}</p>
                      </div>
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <ArrowRight size={16} className="text-white/40" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === 'access' && selectedParcelId && (
                <AccessListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
              )}
              {activeTab === 'ban' && selectedParcelId && (
                <BanListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
              )}
              {activeTab === 'logs' && selectedParcelId && (
                <LogsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
              )}
              {activeTab === 'settings' && selectedParcelId && (
                <SettingsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
