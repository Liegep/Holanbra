import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Ban, ScrollText, Settings, Power, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import Toast, { ToastType } from '../Toast';

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
  const [managersCount, setManagersCount] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const fetchManagersCount = async () => {
    if (!selectedParcelId || !residentUuid) return;
    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manager-list',
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setManagersCount(result.data.length);
      }
    } catch (err) {
      console.error('Error fetching managers count:', err);
    }
  };

  const fetchLogs = async () => {
    if (!selectedParcelId || !residentUuid) return;
    setLoadingLogs(true);
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
        // Limit to 10 for dashboard view
        setLogs(result.data.slice(0, 10));
      }
    } catch (err) {
      console.error('Error fetching dashboard logs:', err);
    } finally {
      setLoadingLogs(false);
    }
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
    fetchManagersCount();
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
        body: JSON.stringify({ 
          action: 'toggle',
          parcel_id: parcelId, 
          active: !isActive, 
          resident_uuid: residentUuidData 
        })
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
        showToast(updatedSecurity.active ? 'Security Activated' : 'Security Disabled');
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 pt-20 sm:p-6 sm:pt-24 lg:pt-28 md:px-10 no-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-6xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        {/* Screw Heads - Simplified */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 hidden sm:block" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 hidden sm:block" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 hidden sm:block" />
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-white/5 border border-white/10 hidden sm:block" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
               "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
               currentSecurity?.active 
                 ? "bg-emerald-500 text-black" 
                 : "bg-white/5 text-white/20 border border-white/10"
            )}>
              <Shield size={16} className={currentSecurity?.active ? "animate-pulse" : ""} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white truncate">
                {t('security.title')}
              </h2>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest",
                  currentSecurity?.active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {currentSecurity?.active ? t('security.active') : t('security.standby')}
                </div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold truncate max-w-[200px]">
                  {selectedParcelName || t('security.no_linked_node')}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all border border-white/5 group"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Global Parcel Selector */}
        {!loading && properties.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex flex-wrap gap-1.5 shrink-0">
            {properties.map(p => (
              <button
                key={p.casperlet_id}
                onClick={() => {
                  setSelectedParcelId(p.casperlet_id);
                  setSelectedParcelName(p.name);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5",
                  selectedParcelId === p.casperlet_id
                    ? "bg-amber-500 border-amber-400 text-black shadow-lg"
                    : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                )}
              >
                <MapPin size={10} />
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-white/5 border-t-amber-500 animate-spin" />
                <Shield size={48} className="absolute inset-0 m-auto text-amber-500/50 animate-pulse" />
              </div>
              <p className="text-lg font-black uppercase tracking-[0.4em] text-amber-500">{t('security.initializing_grid')}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 text-center px-6 sm:px-12">
              <Shield size={64} className="text-white/5" />
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">{t('security.no_active_nodes')}</h3>
                <p className="text-xs text-white/30 uppercase tracking-widest break-words max-w-[300px] text-center mx-auto">{t('security.no_nodes_desc')}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 md:p-6 h-full">
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-4 max-w-4xl mx-auto h-full">
                  {/* Central Console - Compact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative flex flex-col items-center gap-4 bg-zinc-900/30 p-6 rounded-2xl border border-white/5 overflow-hidden group">
                      <div className={cn(
                        "absolute inset-0 transition-opacity duration-1000 blur-[80px] opacity-10",
                        currentSecurity?.active ? "bg-emerald-500" : "bg-red-500"
                      )} />

                      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
                        <div className="text-center">
                          <h4 className="text-[9px] font-black text-amber-500/50 uppercase tracking-[0.4em]">{t('security.core_control')}</h4>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">{selectedParcelName}</h3>
                        </div>

                        <button
                          onClick={() => handleToggle(selectedParcelId!)}
                          disabled={toggling === selectedParcelId}
                          className={cn(
                            "w-40 h-14 rounded-full border-2 transition-all duration-300 flex items-center p-1.5 relative shadow-inner active:scale-95",
                            currentSecurity?.active 
                              ? "bg-emerald-500 border-emerald-400 justify-end" 
                              : "bg-zinc-800 border-white/10 justify-start"
                          )}
                        >
                          <motion.div
                            layout
                            className={cn(
                              "w-10 h-10 rounded-full shadow-xl flex items-center justify-center",
                              currentSecurity?.active ? "bg-white" : "bg-zinc-700"
                            )}
                          >
                             <Power size={14} className={cn(currentSecurity?.active ? "text-emerald-500" : "text-white/20")} />
                          </motion.div>
                          
                          <span className={cn(
                            "absolute text-[9px] font-black uppercase tracking-widest",
                            currentSecurity?.active 
                              ? "left-5 text-white/60" 
                              : "right-5 text-white/20"
                          )}>
                            {currentSecurity?.active ? t('security.on') : t('security.off')}
                          </span>
                        </button>
                        
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                             <div className={cn("w-1.5 h-1.5 rounded-full", currentSecurity?.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-zinc-800")} />
                             <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">{t('security.active')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <div className={cn("w-1.5 h-1.5 rounded-full", currentSecurity?.orb_token ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" : "bg-zinc-800")} />
                             <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">{t('properties.perks.security_orb')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: t('security.radius'), value: `${currentSecurity?.radius || 0}${t('security.meters')[0]}`, color: 'text-blue-400' },
                        { label: t('security.timer_label'), value: `${currentSecurity?.warn_time || 0}s`, color: 'text-amber-400' },
                        { label: t('security.ask_before'), value: currentSecurity?.ask_before ? t('admin.common.yes', 'YES') : t('admin.common.no', 'NO'), color: 'text-purple-400' },
                        { 
                          label: t('security.managers_display'), 
                          value: managersCount === null 
                            ? t('security.loading') 
                            : managersCount === 0 
                              ? t('security.no_managers') 
                              : `${managersCount} ${t('security.configured')}`, 
                          color: 'text-zinc-400'
                        }
                      ].map((stat, i) => (
                        <div 
                          key={i} 
                          className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-center transition-all"
                        >
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{stat.label}</span>
                          <div className="flex items-baseline justify-between gap-1">
                            <span className={cn("text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1", stat.color)}>{stat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logs & Quick Actions Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20 sm:pb-24">
                    {/* Compact Logs Sub-Panel */}
                    <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 h-full max-h-[300px]">
                      <div className="flex items-center justify-between shrink-0">
                        <h4 className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">{t('security.live_activity')}</h4>
                        <button onClick={fetchLogs} className="text-[8px] font-black text-amber-500 uppercase tracking-widest hover:text-white">{t('security.refresh')}</button>
                      </div>
                      <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                        {loadingLogs ? (
                          <div className="text-white/10 text-[9px] uppercase text-center mt-8">{t('security.monitoring_sync')}</div>
                        ) : logs.length === 0 ? (
                          <div className="text-white/10 text-[9px] uppercase text-center mt-8">{t('security.no_activity')}</div>
                        ) : (
                          logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-[8px] bg-black/20 p-2 rounded-lg border border-white/[0.03]">
                              <span className="text-white/60 font-medium truncate max-w-[120px]">{log.avatar_name}</span>
                              <span className={cn(
                                "font-black uppercase text-[7px]",
                                log.action === 'ejected' ? 'text-red-500' : 
                                log.action === 'warned' ? 'text-amber-500' : 
                                'text-emerald-500'
                              )}>{log.action}</span>
                              <span className="text-white/20 font-mono italic">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <button onClick={() => setActiveTab('logs')} className="w-full py-1.5 text-[7px] font-black text-white/20 uppercase hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all shrink-0">{t('security.view_all_logs')}</button>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'access', label: t('security.access_control'), icon: Users, color: 'text-blue-400', desc: t('security.residents') },
                        { id: 'ban', label: t('security.restriction'), icon: Ban, color: 'text-red-400', desc: t('security.blacklist') },
                        { id: 'settings', label: t('security.setup'), icon: Settings, color: 'text-zinc-400', desc: t('security.orb_tuning') },
                        { id: 'logs', label: t('security.history'), icon: ScrollText, color: 'text-amber-400', desc: t('security.audit_trails') }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className="bg-zinc-900/30 border border-white/5 p-3 rounded-2xl flex flex-col items-start gap-1.5 hover:bg-white/5 transition-all text-left active:scale-95"
                        >
                          <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                          <div>
                            <p className="text-[8px] font-black text-white uppercase tracking-widest">{item.label}</p>
                            <p className="text-[6px] text-white/20 uppercase font-bold">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

                  {/* Quick Actions Grid Removed Duplicate Token Footer */}

                  {activeTab === 'access' && (
                    <div className="pb-20 sm:pb-24">
                      <AccessListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} residentUuid={residentUuid} />
                    </div>
                  )}
                  {activeTab === 'ban' && (
                    <div className="pb-20 sm:pb-24">
                      <BanListTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} residentUuid={residentUuid} />
                    </div>
                  )}
                  {activeTab === 'logs' && (
                    <div className="pb-20 sm:pb-24">
                      <LogsTab selectedParcelId={selectedParcelId} properties={properties} onParcelSelect={setSelectedParcelId} residentUuid={residentUuid || null} />
                    </div>
                  )}
                  {activeTab === 'settings' && (
                    <div className="pb-20 sm:pb-24">
                      <SettingsTab 
                        selectedParcelId={selectedParcelId} 
                        properties={properties} 
                        onParcelSelect={setSelectedParcelId} 
                        residentUuid={residentUuid}
                        currentSecurity={selectedParcelId ? securityData[selectedParcelId] : null}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

        {/* Global Tab Navigation */}
        <div className="grid grid-cols-5 bg-zinc-950/90 border-t border-white/5 p-2 gap-1.5 md:gap-2 shrink-0">
          {[
            { id: 'dashboard', label: t('security.dashboard'), icon: Shield },
            { id: 'access', label: t('security.access_list'), icon: Users },
            { id: 'ban', label: t('security.ban_list'), icon: Ban },
            { id: 'logs', label: t('security.event_log'), icon: ScrollText },
            { id: 'settings', label: t('security.setup'), icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "min-w-0 h-14 md:h-16 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-xl md:rounded-2xl transition-all relative shrink-0",
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                  : "bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <tab.icon size={16} className="shrink-0 md:w-5 md:h-5" />
              <span className="truncate w-full md:w-auto text-center md:text-left text-[7px] md:text-[9px] font-black uppercase tracking-widest px-0.5">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div layoutId="global-tab" className="absolute inset-0 bg-amber-500 rounded-xl md:rounded-2xl -z-10" />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
