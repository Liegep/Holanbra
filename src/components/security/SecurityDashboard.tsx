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
  const [toggleError, setToggleError] = useState<string | null>(null);
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
          console.log("[Debug] No residentUuid found");
          setLoading(false);
          return;
        }

        console.log("[Debug] Fetching properties for UUID:", finalUuid);
        const { data: mainProps, error: mainPropsError } = await supabase
          .from('properties')
          .select('casperlet_id, name, tenant_id, id')
          .eq('tenant_id', finalUuid);

        if (mainPropsError) {
          console.error("Error fetching main properties:", mainPropsError);
        }

        console.log("[Debug] Main props:", mainProps);
        
        const { data: tenantEntries, error: tenantEntriesError } = await supabase
          .from('property_tenants')
          .select('property_id')
          .eq('tenant_id', finalUuid);
        
        if (tenantEntriesError) {
          console.error("Error fetching tenant entries:", tenantEntriesError);
        }
        console.log("[Debug] Tenant entries:", tenantEntries);

        let subProps: any[] = [];
        if (tenantEntries && tenantEntries.length > 0) {
          const propertyIds = tenantEntries.map(e => e.property_id);
          const { data: subData, error: subDataError } = await supabase
            .from('properties')
            .select('casperlet_id, name, tenant_id, id')
            .in('id', propertyIds);
          if (subDataError) {
            console.error("Error fetching sub properties:", subDataError);
          }
          if (subData) {
            subProps = subData;
            console.log("[Debug] Sub props:", subProps);
          }
        }

        const combined = [...(mainProps || []), ...subProps];
        const validProperties = combined.filter((v, i, a) => 
          v.casperlet_id && a.findIndex(t => t.casperlet_id === v.casperlet_id) === i
        );
        
        console.log("[Debug] Final properties:", validProperties);
        setProperties(validProperties);
        setLoading(false);
      } catch (err) {
        console.error("Error loading security dashboard:", err);
        setLoading(false);
      }
    }
    loadProperties();
  }, [residentUuid, supabase]);

  useEffect(() => {
    if (properties.length > 0) {
        if (!selectedParcelId || !properties.find(p => p.casperlet_id === selectedParcelId)) {
            setSelectedParcelId(properties[0].casperlet_id);
            setSelectedParcelName(properties[0].name);
        }
        if (residentUuid) {
          loadSecurityParcels(properties.map((p: any) => p.casperlet_id));
        }
    }
  }, [properties, residentUuid]);

  useEffect(() => {
    fetchLogs();
  }, [selectedParcelId]);

    async function loadSecurityParcels(ids: string[]) {
      if (ids.length === 0 || !residentUuid) return;
      
      try {
        const response = await fetch('/api/security/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: "status",
            resident_uuid: residentUuid,
            parcel_ids: ids
          })
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
          const mapped = result.data.reduce((acc: any, item: any) => {
            acc[item.casperlet_id] = item;
            return acc;
          }, {});
          
          setSecurityData(prev => ({ ...prev, ...mapped }));
        }
      } catch (err) {
        console.error('Error loading security data:', err);
      }
    }



  const handleToggle = async (parcelId: string) => {
    const security = securityData[parcelId];
    const isActive = security?.active || false;
    setToggling(parcelId);
    setToggleError(null);
    
    try {
      // Usar residentUuid recebido na prop ou o finalUuid carregado
      const residentUuidData = residentUuid;
      
      if (!residentUuidData) {
        throw new Error('No resident UUID available');
      }

      // Use the local API route
      const response = await fetch(`/api/security/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parcel_id: parcelId, active: !isActive, resident_uuid: residentUuidData })
      });

      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        result = { error: rawText };
      }

      if (response.ok) {
        const updatedSecurity = result.data ?? result;
        setSecurityData(prev => ({
          ...prev,
          [parcelId]: updatedSecurity
        }));
      } else {
        console.error('Toggle error', {
          status: response.status,
          statusText: response.statusText,
          body: rawText
        });
        setToggleError(result.error || 'Failed to toggle security. Please try again.');
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error toggling security:', err);
      setToggleError('Failed to toggle security. Please try again.');
    } finally {
      setToggling(null);
    }
  };

  const currentSecurity = selectedParcelId ? securityData[selectedParcelId] : null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 md:p-10 no-scrollbar">
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
        className="relative w-[min(96vw,1200px)] max-w-7xl bg-[#09090b] border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Panel Details - Screw Heads */}
        <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner hidden sm:block" />
        <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner hidden sm:block" />
        <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner hidden sm:block" />
        <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-white/5 border border-white/10 shadow-inner hidden sm:block" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between p-6 sm:p-8 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md gap-4 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className={cn(
               "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl shrink-0",
               currentSecurity?.active 
                 ? "bg-emerald-500 text-black shadow-emerald-500/20" 
                 : "bg-white/5 text-white/20 border border-white/10"
            )}>
              <Shield size={24} className={currentSecurity?.active ? "animate-pulse" : ""} />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white truncate">
                {t('security.title')}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0",
                  currentSecurity?.active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {currentSecurity?.active ? "Authenticated" : "Standby"}
                </div>
                <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold truncate max-w-[150px] sm:max-w-[300px]">
                  {selectedParcelName || "Initializing Link..."}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-white/5 rounded-xl sm:rounded-2xl text-white/20 hover:text-white transition-all border border-white/5 group shrink-0 ml-auto"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
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
            <div className="h-full flex flex-col items-center justify-center gap-8 text-center px-6 sm:px-12">
              <Shield size={64} className="text-white/5" />
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">No Active Nodes</h3>
                <p className="text-xs text-white/30 uppercase tracking-widest break-words max-w-[300px] text-center mx-auto">Unable to detect security orbs linked to your account.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 md:p-12 h-full">
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-6 sm:gap-12 max-w-5xl mx-auto h-full">
                  <div className="text-center">
                    <h3 className={cn("text-xl sm:text-2xl font-black uppercase tracking-[0.2em]", selectedParcelId && securityData[selectedParcelId]?.active ? "text-emerald-500" : "text-white")}>
                      {selectedParcelId && securityData[selectedParcelId]?.active ? "SISTEMA ATIVO" : "SISTEMA STANDBY"}
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
                          "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 max-w-[200px] sm:max-w-xs",
                          selectedParcelId === p.casperlet_id
                            ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Central Console */}
                  <div className="relative flex flex-col items-center gap-8 md:gap-12 bg-[#0c0c0e]/50 p-8 sm:p-12 md:p-20 rounded-[3rem] md:rounded-[5rem] border border-white/5 shadow-2xl overflow-hidden group">
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-1000 blur-[150px] opacity-10",
                      currentSecurity?.active ? "bg-emerald-500" : "bg-red-500"
                    )} />

                    <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 w-full">
                      <div className="text-center space-y-3 w-full">
                        <div className="flex items-center justify-center gap-4">
                          <div className="h-[1px] w-8 sm:w-12 bg-white/10" />
                          <h4 className="text-[10px] sm:text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] sm:tracking-[0.6em]">Core Control</h4>
                          <div className="h-[1px] w-8 sm:w-12 bg-white/10" />
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter w-full max-w-full break-words px-2">{selectedParcelName}</p>
                      </div>

                      <div className="flex flex-col items-center gap-4 sm:gap-6">
                        <button
                          onClick={() => handleToggle(selectedParcelId!)}
                          disabled={toggling === selectedParcelId}
                          className={cn(
                            "w-48 h-16 sm:w-64 sm:h-24 rounded-full border-[4px] transition-all duration-300 flex items-center p-2 xl:p-2 relative shadow-inner active:scale-95",
                            currentSecurity?.active 
                              ? "bg-emerald-500 border-emerald-400 justify-end" 
                              : "bg-zinc-900 border-white/10 justify-start"
                          )}
                        >
                          <motion.div
                            layout
                            className={cn(
                              "w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-xl flex items-center justify-center",
                              currentSecurity?.active ? "bg-white" : "bg-white/10"
                            )}
                          >
                             <Power size={20} className={cn(currentSecurity?.active ? "text-emerald-500" : "text-white/20", "sm:w-6 sm:h-6")} />
                          </motion.div>
                          
                          <span className={cn(
                            "absolute text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
                            currentSecurity?.active 
                              ? "left-6 sm:left-8 text-white/50" 
                              : "right-6 sm:right-8 text-white/20"
                          )}>
                            {currentSecurity?.active ? t('security.on') : t('security.off')}
                          </span>
                        </button>
                        <div className="flex flex-col items-center gap-2 px-4 text-center">
                           <span className="text-[9px] sm:text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{t('security.toggle_assist', 'CLIQUE PARA LIGAR / DESLIGAR')}</span>
                           {toggleError && <span className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest leading-tight">{toggleError}</span>}
                        </div>
                      </div>

                      <div className="flex gap-8 sm:gap-12 flex-wrap justify-center">
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", currentSecurity?.active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", currentSecurity?.orb_token ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Linked</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", currentSecurity?.active ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" : "bg-black")} />
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Alarm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid Navigation */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { id: 'access', label: t('security.access_list'), icon: Users, color: 'blue' },
                      { id: 'ban', label: t('security.ban_list'), icon: Ban, color: 'red' },
                      { id: 'logs', label: t('security.event_log'), icon: ScrollText, color: 'amber' },
                      { id: 'settings', label: t('security.settings'), icon: Settings, color: 'zinc' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className="group relative p-4 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col items-center gap-4 sm:gap-5 text-center active:scale-95 shadow-2xl"
                      >
                        <div className={cn(
                          "w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                          item.color === 'blue' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                          item.color === 'red' && "bg-red-500/10 text-red-400 border border-red-500/20",
                          item.color === 'amber' && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                          item.color === 'zinc' && "bg-white/5 text-white/40 border border-white/10"
                        )}>
                          <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.2em] sm:tracking-[0.3em]">{item.label}</span>
                      </button>
                    ))}
                  </div>

                      {/* Logs Section */}
                  <div className="bg-zinc-900/50 p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] border border-white/5 space-y-4 sm:space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.2em]">Últimos Eventos</h4>
                      <button onClick={fetchLogs} className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-colors underline">Atualizar</button>
                    </div>
                    {loadingLogs ? (
                      <div className="text-white/20 text-xs text-center p-4">Carregando...</div>
                    ) : logs.length === 0 ? (
                      <div className="text-white/20 text-xs text-center p-4">Nenhum evento recente.</div>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log) => {
                          const actionColors = {
                            detected: 'text-amber-400',
                            ejected: 'text-red-400',
                            warned: 'text-orange-400',
                            allowed: 'text-emerald-400',
                            banned: 'text-red-600',
                          };
                          return (
                            <div key={log.id} className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/60 bg-black/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 transition-all flex-wrap sm:flex-nowrap gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{log.avatar_name}</span>
                              </div>
                              <span className={cn("font-black uppercase shrink-0 mx-2", actionColors[log.action as keyof typeof actionColors] || 'text-white')}>{log.action}</span>
                              <span className="text-white/30 shrink-0 ml-auto">{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* QUICK ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                     <button 
                       onClick={() => setActiveTab('access')}
                       className="flex items-center justify-center gap-3 sm:gap-4 py-6 sm:py-8 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-[2rem] sm:rounded-[2.5rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 px-4"
                     >
                       <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                       {t('security.add_avatar')}
                     </button>
                     <button 
                       onClick={() => setActiveTab('ban')}
                       className="flex items-center justify-center gap-3 sm:gap-4 py-6 sm:py-8 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white rounded-[2rem] sm:rounded-[2.5rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 px-4"
                     >
                       <Ban className="w-5 h-5 sm:w-6 sm:h-6" />
                       {t('security.ban_avatar', 'Ban Avatar')}
                     </button>
                  </div>

                  {/* Token Footer */}
                  {currentSecurity?.orb_token && (
                    <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row items-center md:justify-between gap-6 sm:gap-8 mt-auto w-full">
                      <div className="space-y-1 text-center md:text-left shrink-0">
                        <h5 className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">Encryption Key</h5>
                        <p className="text-emerald-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">Authenticated Node</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto items-center">
                        <div className="px-4 sm:px-6 py-3 bg-black/40 rounded-xl font-mono text-[9px] sm:text-[10px] text-white/40 border border-white/5 select-all truncate w-full sm:w-auto max-w-full md:max-w-xs lg:max-w-md text-center sm:text-left">
                          {currentSecurity.orb_token}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentSecurity.orb_token);
                            alert(t('security.token_copied'));
                          }}
                          className="px-4 sm:px-6 py-3 bg-amber-500 text-black hover:bg-amber-400 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                        >
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'access' && (
                <AccessListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} residentUuid={residentUuid} />
              )}
              {activeTab === 'ban' && (
                <BanListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} residentUuid={residentUuid} />
              )}
              {activeTab === 'logs' && (
                <LogsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab 
                  selectedParcelId={selectedParcelId} 
                  properties={properties} 
                  onParcelSelect={setSelectedParcelId} 
                  residentUuid={residentUuid}
                  currentSecurity={selectedParcelId ? securityData[selectedParcelId] : null}
                />
              )}
            </div>
          )}
        </div>

        {/* Global Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap bg-[#0d0d0f] border-t border-white/5 p-2 sm:p-4 gap-1 sm:gap-2 shrink-0">
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
                "flex-1 min-w-[60px] flex flex-col items-center justify-center gap-1.5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all group overflow-hidden relative",
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                  : "bg-white/[0.02] text-white/20 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <tab.icon size={18} className="relative z-10 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
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
