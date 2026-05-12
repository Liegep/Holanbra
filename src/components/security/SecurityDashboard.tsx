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
  residentUuid?: string;
}

export function SecurityDashboard({ onClose, residentUuid }: SecurityDashboardProps) {
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
      try {
        let finalUuid = residentUuid;

        if (!finalUuid) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) finalUuid = user.id;
        }

        if (!finalUuid) {
          setLoading(false);
          return;
        }

        // Try to fetch by tenant_id (resident) or user_id (admin)
        const { data, error } = await supabase
          .from('properties')
          .select('casperlet_id, name, tenant_id, user_id')
          .or(`tenant_id.eq.${finalUuid},user_id.eq.${finalUuid}`);

        if (!error && data) {
          const validProperties = data.filter(p => p.casperlet_id);
          setProperties(validProperties);
          if (validProperties.length > 0) {
            setSelectedParcelId(validProperties[0].casperlet_id);
            setSelectedParcelName(validProperties[0].name);
            await loadSecurityParcels(validProperties.map((p: any) => p.casperlet_id));
          }
        }
      } catch (err) {
        console.error("Error loading security dashboard:", err);
      } finally {
        setLoading(false);
      }
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
    { id: 'dashboard', label: t('nav.home'), icon: LayoutGrid },
    { id: 'access', label: t('security.access_list'), icon: Users },
    { id: 'ban', label: t('security.ban_list'), icon: Ban },
    { id: 'logs', label: t('security.event_log'), icon: ScrollText },
    { id: 'settings', label: t('security.settings'), icon: Settings },
  ] as const;

  const currentSecurity = selectedParcelId ? securityData[selectedParcelId] : null;

  // Sync selected parcel if properties load but none selected
  useEffect(() => {
    if (properties.length > 0 && !selectedParcelId) {
      setSelectedParcelId(properties[0].casperlet_id);
      setSelectedParcelName(properties[0].name);
    }
  }, [properties]);

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
        <div className="flex p-3 gap-3 bg-black/60 border-b border-white/10 shadow-inner">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all group relative overflow-hidden",
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50"
                  : "bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.08] hover:border-white/10 border border-transparent"
              )}
            >
              <tab.icon size={20} className={cn("transition-transform group-hover:scale-110 relative z-10", activeTab === tab.id ? "text-black" : "text-white/20")} />
              <span className="text-[8px] sm:text-[10px] relative z-10 whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="tab-active"
                  className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 opacity-100"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Region */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 sm:p-10 custom-scrollbar bg-black/20">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin" />
                <Shield className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={32} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[14px] font-black uppercase tracking-[0.5em] text-amber-500 animate-pulse">
                  ENCRYPTING CONNECTION
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Establishing secure tunnel to Second Life...
                </p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-10">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
                <Shield size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black uppercase tracking-widest">No Security Nodes Found</h3>
                <p className="text-xs text-white/30 leading-relaxed max-w-xs">
                  We couldn't find any properties assigned to you with a valid Security Orb system.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              key={activeTab + (selectedParcelId || 'none')}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              {!selectedParcelId ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                  <div className="p-8 bg-zinc-900 rounded-full border border-white/10 animate-pulse">
                    <LayoutGrid size={48} className="text-white/10" />
                  </div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Select a parcel to begin management</p>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <div className="flex flex-col gap-10 h-full">
                      {/* MAIN ON/OFF CONTROLLER */}
                      <div className="flex flex-col items-center gap-8 p-10 sm:p-16 rounded-[4rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
                         {/* Background Atmosphere */}
                        <div className={cn(
                          "absolute inset-0 transition-opacity duration-1000 blur-[120px] opacity-20 group-hover:opacity-40",
                          currentSecurity?.is_active ? "bg-emerald-500" : "bg-zinc-800"
                        )} />

                        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
                          <div className="text-center space-y-2">
                            <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">SYSTEM INTERFACE</h4>
                            <p className="text-xl font-black text-white uppercase tracking-widest drop-shadow-lg">{selectedParcelName}</p>
                          </div>

                          <button
                            onClick={() => handleToggle(selectedParcelId)}
                            disabled={toggling === selectedParcelId}
                            className={cn(
                              "w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 transition-all duration-700 flex flex-col items-center justify-center gap-4 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] group/btn active:scale-95",
                              currentSecurity?.is_active 
                                ? "bg-emerald-500 border-emerald-400/50 shadow-emerald-500/50" 
                                : "bg-zinc-900 border-zinc-800 shadow-white/5"
                            )}
                          >
                            <div className={cn(
                              "absolute inset-0 rounded-full animate-ping opacity-30 bg-emerald-400 duration-[2s]",
                              !currentSecurity?.is_active && "hidden"
                            )} />
                            
                            <Power size={80} className={cn(
                              "transition-all duration-700",
                              currentSecurity?.is_active ? "text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" : "text-white/10 scale-90",
                              toggling === selectedParcelId && "animate-spin"
                            )} />
                            
                            <div className="flex flex-col items-center">
                              <span className={cn(
                                "text-2xl font-black uppercase tracking-[0.3em] transition-all duration-700",
                                currentSecurity?.is_active ? "text-white" : "text-white/20"
                              )}>
                                {currentSecurity?.is_active ? t('security.on') : t('security.off')}
                              </span>
                              <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest mt-1",
                                 currentSecurity?.is_active ? "text-emerald-200" : "text-white/10"
                              )}>
                                {currentSecurity?.is_active ? t('security.active').toUpperCase() : t('security.inactive').toUpperCase()}
                              </span>
                            </div>
                          </button>

                          {currentSecurity?.token && (
                            <div className="w-full mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2">
                               <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Orb Token</span>
                                 <button 
                                   onClick={() => {
                                     navigator.clipboard.writeText(currentSecurity.token);
                                     alert(t('security.token_copied'));
                                   }}
                                   className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest"
                                 >
                                   {t('security.copy_token')}
                                 </button>
                               </div>
                               <div className="font-mono text-[10px] text-white/60 bg-black/40 px-3 py-2 rounded-lg border border-white/5 break-all">
                                 {currentSecurity.token}
                               </div>
                            </div>
                          )}

                          <div className="flex gap-4">
                            <div className={cn(
                              "px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all",
                              currentSecurity?.is_active 
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                                : "bg-zinc-800 border-white/10 text-white/40"
                            )}>
                              {currentSecurity?.is_active ? 'DEFENSE ACTIVE' : 'SYSTEM STANDBY'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACCESS GRID */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                          { id: 'access', label: t('security.access_list'), icon: Users, color: 'blue' },
                          { id: 'ban', label: t('security.ban_list'), icon: Ban, color: 'red' },
                          { id: 'logs', label: t('security.event_log'), icon: ScrollText, color: 'amber' },
                          { id: 'settings', label: t('security.settings'), icon: Settings, color: 'zinc' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col items-center gap-4 text-center active:scale-95 shadow-xl"
                          >
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner",
                              item.color === 'blue' && "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 shadow-blue-500/20",
                              item.color === 'red' && "bg-red-500/10 text-red-400 ring-1 ring-red-500/20 shadow-red-500/20",
                              item.color === 'amber' && "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 shadow-amber-500/20",
                              item.color === 'zinc' && "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20 shadow-zinc-500/20"
                            )}>
                              <item.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em] transition-colors">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'access' && (
                    <AccessListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
                  )}
                  {activeTab === 'ban' && (
                    <BanListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
                  )}
                  {activeTab === 'logs' && (
                    <LogsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
                  )}
                  {activeTab === 'settings' && (
                    <SettingsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
