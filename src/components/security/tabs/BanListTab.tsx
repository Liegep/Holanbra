import React, { useState, useEffect } from 'react';
import { UserX, Trash2, Search, MapPin, Gavel } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { AddBanForm } from '../forms/AddBanForm';

interface BanListTabProps {
  selectedParcelId: string | null;
  properties: any[];
  onParcelSelect: (id: string) => void;
}

export function BanListTab({ selectedParcelId, properties, onParcelSelect }: BanListTabProps) {
  const { t } = useTranslation();
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedParcelId) return;

    async function loadBanList() {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_ban_list')
        .select('*')
        .eq('casperlet_id', selectedParcelId)
        .order('created_at', { ascending: false });

      if (!error && data) setBans(data);
      setLoading(false);
    }

    loadBanList();
  }, [selectedParcelId]);

  const removeBan = async (id: string) => {
    const { error } = await supabase
      .from('security_ban_list')
      .delete()
      .eq('id', id);

    if (!error) {
      setBans(prev => prev.filter(b => b.id !== id));
    }
  };

  const filteredBans = bans.filter(b => 
    b.avatar_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder={t('team.placeholder_name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl text-[11px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all uppercase tracking-wider"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20"
        >
          <UserX size={14} />
          {t('security.add_avatar')}
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
          ))
        ) : filteredBans.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/10 uppercase font-black text-[10px] tracking-[0.3em]">
            {t('security.no_avatars')}
          </div>
        ) : (
          filteredBans.map((ban) => (
            <div
              key={ban.id}
              className="flex items-center justify-between p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Gavel size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                    {ban.avatar_name}
                  </h4>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 text-white/30">
                    {ban.avatar_uuid}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeBan(ban.id)}
                  className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title={t('security.unban')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <AddBanForm
          casperletId={selectedParcelId!}
          onClose={() => setShowAddForm(false)}
          onSuccess={(newBan) => {
            setBans(prev => [newBan, ...prev]);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}
