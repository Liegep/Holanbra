import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Ban, ScrollText, Settings, LayoutGrid } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'parcels' | 'access' | 'ban' | 'logs' | 'settings'>('parcels');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
      }
      setLoading(false);
    }

    loadProperties();
  }, []);

  const tabs = [
    { id: 'parcels', label: t('security.parcel'), icon: LayoutGrid },
    { id: 'access', label: t('security.access_list'), icon: Users },
    { id: 'ban', label: t('security.ban_list'), icon: Ban },
    { id: 'logs', label: t('security.event_log'), icon: ScrollText },
    { id: 'settings', label: t('security.settings'), icon: Settings },
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20 shadow-inner">
              <Shield size={20} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                {t('security.title')}
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mt-0.5 font-bold">
                Remote Terminal System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20 p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-100"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5 scale-95"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-transparent to-black/20 p-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/20">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <p className="text-[10px] font-black underline decoration-amber-500/50 underline-offset-8 uppercase tracking-[0.4em]">
                {t('security.loading')}
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'parcels' && (
                <ParcelsTab properties={properties} />
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
        </div>
      </motion.div>
    </div>
  );
}
