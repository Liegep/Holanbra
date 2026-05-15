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
  residentUuid?: string;
}

export function BanListTab({ selectedParcelId, properties, onParcelSelect, residentUuid }: BanListTabProps) {
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder={t('team.placeholder_name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[11px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all uppercase tracking-wider"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/10 active:scale-95 shrink-0"
        >
          <UserX size={14} />
          <span className="hidden sm:inline">Ban Avatar</span>
        </button>
      </div>

      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 animate-pulse rounded-lg" />
          ))
        ) : filteredBans.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-white/10 uppercase font-black text-[10px] tracking-[0.3em] bg-white/[0.01]">
            No Entities Banned
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {filteredBans.map((ban) => (
              <div
                key={ban.id}
                className="group flex items-center justify-between p-2 sm:p-3 bg-white/[0.02] hover:bg-red-500/[0.03] border border-white/[0.04] rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center ring-1 ring-red-500/20 shrink-0">
                    <Gavel size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors truncate">
                      {ban.avatar_name}
                    </h4>
                    {ban.reason && (
                      <span className="text-[8px] text-white/20 uppercase tracking-tight truncate block">
                        {ban.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => removeBan(ban.id)}
                    className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                    title={t('security.remove_ban', 'Remover Ban')}
                  >
                    <Trash2 size={14} />
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
          residentUuid={residentUuid!}
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
