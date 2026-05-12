import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Ban, ScrollText, Settings, Power, ArrowRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// Import Tabs
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
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    if (!selectedParcelId) return;
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .eq('casperlet_id', selectedParcelId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) setLogs(data);
    setLoadingLogs(false);
  };
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

        // Fetch properties where the user is the main tenant OR an admin
        const { data: mainProps } = await supabase
          .from('properties')
          .select('casperlet_id, name, tenant_id, user_id, id')
          .or(`tenant_id.eq.${finalUuid},user_id.eq.${finalUuid}`);

        // Fetch properties where the user is a sub-tenant
        const { data: tenantEntries } = await supabase
          .from('property_tenants')
          .select('property_id')
          .eq('tenant_id', finalUuid);

        let subProps: any[] = [];
        if (tenantEntries && tenantEntries.length > 0) {
          const propertyIds = tenantEntries.map(e => e.property_id);
          const { data: subData } = await supabase
            .from('properties')
            .select('casperlet_id, name, tenant_id, user_id, id')
            .in('id', propertyIds);
          if (subData) subProps = subData;
        }

        const combined = [...(mainProps || []), ...subProps];
        const validProperties = combined.filter((v, i, a) => 
          v.casperlet_id && a.findIndex(t => t.casperlet_id === v.casperlet_id) === i
        );
        
        setProperties(validProperties);

        if (validProperties.length > 0) {
          if (!selectedParcelId || !validProperties.find(p => p.casperlet_id === selectedParcelId)) {
            setSelectedParcelId(validProperties[0].casperlet_id);
            setSelectedParcelName(validProperties[0].name);
          }
          await loadSecurityParcels(validProperties.map((p: any) => p.casperlet_id));
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
  }, [residentUuid]);

  useEffect(() => {
    if (properties.length > 0 && !selectedParcelId) {
      setSelectedParcelId(properties[0].casperlet_id);
      setSelectedParcelName(properties[0].name);
    }
  }, [properties]);

  const handleToggle = async (parcelId: string) => {
    const security = securityData[parcelId];
    const isActive = security?.is_active || false;
    setToggling(parcelId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !residentUuid) return;

      const { error } = await supabase
        .from('security_parcels')
        .upsert({ 
          casperlet_id: parcelId,
          is_active: !isActive,
          orb_token: security?.orb_token || security?.token || crypto.randomUUID()
        }, { onConflict: 'casperlet_id' });

      if (!error) {
        const newOrbToken = security?.orb_token || security?.token || (securityData[parcelId]?.orb_token) || 'generating...'; 
        // Note: the upsert happened, ideally we'd refresh, but let's at least keep state consistent
        setSecurityData(prev => ({
          ...prev,
          [parcelId]: { 
            ...(prev[parcelId] || {}), 
            is_active: !isActive,
            // If it was newly generated in the DB, it's better to let the user refresh or fetch it.
            // But we can try to guess it if we just saved it.
          }
        }));
        // Reload parcel data to get the generated token if it was new
        if (!security?.orb_token && !security?.token) {
           const { data } = await supabase.from('security_parcels').select('*').eq('casperlet_id', parcelId).single();
           if (data) {
             setSecurityData(prev => ({ ...prev, [parcelId]: data }));
           }
        }
      }
    } finally {
      setToggling(null);
    }
  };

  const currentSecurity = selectedParcelId ? securityData[selectedParcelId] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 no-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Panel Details - Screw Heads */}
        <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner" />
        <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner" />
        <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner" />
        <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
               currentSecurity?.is_active 
                 ? "bg-emerald-500 text-black shadow-emerald-500/20" 
                 : "bg-white/5 text-white/20 border border-white/10"
            )}>
              <Shield size={28} className={currentSecurity?.is_active ? "animate-pulse" : ""} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-[0.4em] text-white">
                {t('security.title')}
              </h2>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                  currentSecurity?.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {currentSecurity?.is_active ? "Authenticated" : "Standby"}
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
                  {selectedParcelName || "Initializing Link..."}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all border border-white/5 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-white/5 border-t-amber-500 animate-spin" />
                <Shield size={48} className="absolute inset-0 m-auto text-amber-500/50 animate-pulse" />
              </div>
              <p className="text-lg font-black uppercase tracking-[0.4em] text-amber-500">Initializing Grid</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 text-center px-12">
              <Shield size={64} className="text-white/5" />
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">No Active Nodes</h3>
                <p className="text-xs text-white/30 uppercase tracking-widest">Unable to detect security orbs linked to your account.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-12 h-full">
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-12 max-w-4xl mx-auto h-full">
                  <div className="text-center">
                    <h3 className={cn("text-2xl font-black uppercase tracking-[0.2em]", selectedParcelId && securityData[selectedParcelId]?.is_active ? "text-emerald-500" : "text-white")}>
                      {selectedParcelId && securityData[selectedParcelId]?.is_active ? "SISTEMA ATIVO" : "SISTEMA STANDBY"}
                    </h3>
                  </div>
                  {/* Parcel Selector */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {properties.map(p => (
                      <button
                        key={p.casperlet_id}
                        onClick={() => {
                          setSelectedParcelId(p.casperlet_id);
                          setSelectedParcelName(p.name);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                          selectedParcelId === p.casperlet_id
                            ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        <MapPin size={12} />
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Central Console */}
                  <div className="relative flex flex-col items-center gap-12 bg-[#0c0c0e]/50 p-12 sm:p-20 rounded-[5rem] border border-white/5 shadow-2xl overflow-hidden group">
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-1000 blur-[150px] opacity-10",
                      currentSecurity?.is_active ? "bg-emerald-500" : "bg-red-500"
                    )} />

                    <div className="relative z-10 flex flex-col items-center gap-12 w-full">
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-4">
                          <div className="h-[1px] w-12 bg-white/10" />
                          <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.6em]">Core Control</h4>
                          <div className="h-[1px] w-12 bg-white/10" />
                        </div>
                        <p className="text-3xl font-black text-white uppercase tracking-tighter">{selectedParcelName}</p>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        <button
                          onClick={() => handleToggle(selectedParcelId!)}
                          disabled={toggling === selectedParcelId}
                          className={cn(
                            "w-64 h-64 sm:w-72 sm:h-72 rounded-full border-[12px] transition-all duration-700 flex flex-col items-center justify-center gap-6 relative shadow-2xl active:scale-95 group/btn",
                            currentSecurity?.is_active 
                              ? "bg-emerald-500 border-white/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]" 
                              : "bg-zinc-900 border-white/5 shadow-inner"
                          )}
                        >
                          <AnimatePresence>
                            {currentSecurity?.is_active && (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 0.2 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-full bg-emerald-400"
                              />
                            )}
                          </AnimatePresence>
                          
                          <Power size={90} className={cn(
                            "transition-all duration-700",
                            currentSecurity?.is_active ? "text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" : "text-white/5 scale-90",
                            toggling === selectedParcelId && "animate-spin"
                          )} />
                          
                          <span className={cn(
                            "text-3xl font-black uppercase tracking-[0.2em] transition-all duration-700",
                            currentSecurity?.is_active ? "text-white" : "text-white/20"
                          )}>
                            {currentSecurity?.is_active ? t('security.on') : t('security.off')}
                          </span>
                        </button>
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.3em]">{t('security.toggle_assist', 'CLIQUE PARA LIGAR / DESLIGAR')}</span>
                        </div>
                      </div>

                      <div className="flex gap-12">
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2.5 h-2.5 rounded-full", currentSecurity?.is_active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2.5 h-2.5 rounded-full", currentSecurity?.orb_token ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Linked</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2.5 h-2.5 rounded-full", currentSecurity?.is_active ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Alarm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid Navigation */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { id: 'access', label: t('security.access_list'), icon: Users, color: 'blue' },
                      { id: 'ban', label: t('security.ban_list'), icon: Ban, color: 'red' },
                      { id: 'logs', label: t('security.event_log'), icon: ScrollText, color: 'amber' },
                      { id: 'settings', label: t('security.settings'), icon: Settings, color: 'zinc' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className="group relative p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col items-center gap-5 text-center active:scale-95 shadow-2xl"
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                          item.color === 'blue' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                          item.color === 'red' && "bg-red-500/10 text-red-400 border border-red-500/20",
                          item.color === 'amber' && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                          item.color === 'zinc' && "bg-white/5 text-white/40 border border-white/10"
                        )}>
                          <item.icon size={28} />
                        </div>
                        <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em]">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Logs Section */}
                  <div className="bg-zinc-900/50 p-6 rounded-[3rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Últimos Eventos</h4>
                      <button onClick={fetchLogs} className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-colors underline">Atualizar</button>
                    </div>
                    {loadingLogs ? (
                      <div className="text-white/20 text-xs text-center p-4">Carregando...</div>
                    ) : logs.length === 0 ? (
                      <div className="text-white/20 text-xs text-center p-4">Nenhum evento recente.</div>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex justify-between text-[10px] font-mono text-white/60 bg-black/20 p-3 rounded-lg border border-white/5">
                            <span>{log.avatar_name} - {log.action}</span>
                            <span className="text-white/30">{new Date(log.created_at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* QUICK ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                       onClick={() => setActiveTab('access')}
                       className="flex items-center justify-center gap-4 py-6 bg-blue-600 text-white hover:bg-blue-500 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 transition-all active:scale-95"
                     >
                       <Users size={20} />
                       {t('security.add_avatar')}
                     </button>
                     <button 
                       onClick={() => setActiveTab('ban')}
                       className="flex items-center justify-center gap-4 py-6 bg-red-600 text-white hover:bg-red-500 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/10 transition-all active:scale-95"
                     >
                       <Ban size={20} />
                       {t('security.ban_avatar', 'Ban Avatar')}
                     </button>
                  </div>

                  {/* Token Footer */}
                  {currentSecurity?.orb_token && (
                    <div className="p-8 rounded-[3rem] bg-zinc-900/50 border border-white/5 flex items-center justify-between gap-8 mt-auto">
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Encryption Key</h5>
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Authenticated Node</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="px-6 py-3 bg-black/40 rounded-xl font-mono text-[10px] text-white/40 border border-white/5 select-all truncate max-w-[240px]">
                          {currentSecurity.orb_token}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentSecurity.orb_token);
                            alert(t('security.token_copied'));
                          }}
                          className="px-6 py-3 bg-amber-500 text-black hover:bg-amber-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                        >
                          <ArrowRight size={14} />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
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
            </div>
          )}
        </div>

        {/* Global Tab Navigation */}
        <div className="flex bg-[#0d0d0f] border-t border-white/5 p-4 gap-2">
          {[
            { id: 'dashboard', label: 'Terminal', icon: Shield },
            { id: 'access', label: t('security.access_list'), icon: Users },
            { id: 'ban', label: t('security.ban_list'), icon: Ban },
            { id: 'logs', label: t('security.event_log'), icon: ScrollText },
            { id: 'settings', label: t('security.settings'), icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all group overflow-hidden relative",
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                  : "bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <tab.icon size={18} className="relative z-10" />
              <span className="relative z-10 hidden sm:inline-block">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="global-tab" className="absolute inset-0 bg-amber-500" />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
