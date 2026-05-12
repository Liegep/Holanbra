import React, { useState, useEffect } from 'react';
import { UserX, Trash2, Search, MapPin, Gavel, Ban } from 'lucide-react';
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
          className="px-10 py-5 bg-red-500 text-white hover:bg-red-600 rounded-[2rem] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-red-500/40 group shrink-0"
        >
          <UserX size={22} className="group-hover:rotate-12 transition-transform" />
          BAN AVATAR
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-[2rem]" />
          ))
        ) : filteredBans.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem] text-white/10 gap-6 bg-white/[0.01]">
            <div className="p-6 bg-white/5 rounded-full ring-1 ring-white/10">
              <Ban size={48} className="opacity-20" />
            </div>
            <span className="uppercase font-black text-[11px] tracking-[0.4em]">No Entities Banned</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBans.map((ban) => (
              <div
                key={ban.id}
                className="group flex items-center justify-between p-6 bg-white/[0.03] hover:bg-red-500/[0.06] border border-white/10 rounded-[2.5rem] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center ring-1 ring-red-500/20 shadow-inner transition-all group-hover:scale-110">
                    <Gavel size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest group-hover:text-red-400 transition-colors">
                      {ban.avatar_name}
                    </h4>
                    {ban.avatar_uuid && (
                      <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1.5 p-1 px-2 bg-black/40 rounded-lg border border-white/5">
                        {ban.avatar_uuid}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeBan(ban.id)}
                    className="px-6 py-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {t('security.unban')}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
