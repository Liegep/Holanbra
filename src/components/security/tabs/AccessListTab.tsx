import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck, User, Search, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { AddAvatarForm } from '../forms/AddAvatarForm';

interface AccessListTabProps {
  selectedParcelId: string | null;
  properties: any[];
  onParcelSelect: (id: string) => void;
  residentUuid?: string;
}

export function AccessListTab({ selectedParcelId, properties, onParcelSelect, residentUuid }: AccessListTabProps) {
  const { t } = useTranslation();
  const [avatars, setAvatars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAccessList = async () => {
    if (!selectedParcelId || !residentUuid) return;
    setLoading(true);
    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid
        })
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        setAvatars(result.data.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (err) {
      console.error('Error loading access list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessList();
  }, [selectedParcelId, residentUuid]);

  const removeAvatar = async (id: string, avatarKey?: string, avatarName?: string) => {
    if (!selectedParcelId || !residentUuid) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          parcel_id: selectedParcelId,
          resident_uuid: residentUuid,
          avatar_key: avatarKey,
          avatar_name: avatarName
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setAvatars(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Error removing avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAvatars = avatars.filter(a => 
    a.avatar_name.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder={t('team.placeholder_name')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-wider"
            />
          </div>
          <button
            onClick={() => loadAccessList()}
            disabled={loading}
            className="px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
            title={t('common.update', 'Atualizar')}
          >
            <Users size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-10 py-5 bg-amber-500 text-black hover:bg-amber-400 rounded-[2rem] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-amber-500/40 group shrink-0"
        >
          <UserPlus size={22} className="group-hover:rotate-12 transition-transform" />
          {t('security.add_avatar')}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-[2rem]" />
          ))
        ) : filteredAvatars.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem] text-white/10 gap-6 bg-white/[0.01]">
            <div className="p-6 bg-white/5 rounded-full ring-1 ring-white/10">
              <Users size={48} className="opacity-20" />
            </div>
            <span className="uppercase font-black text-[11px] tracking-[0.4em]">{t('security.no_avatars')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className="group flex items-center justify-between p-6 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-[2.5rem] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-all group-hover:scale-110",
                    avatar.role === 'manager' 
                      ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 shadow-amber-500/20" 
                      : "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 shadow-blue-500/20"
                  )}>
                    {avatar.role === 'manager' ? <ShieldCheck size={32} /> : <User size={32} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                      {avatar.avatar_name}
                    </h4>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2",
                      avatar.role === 'manager' ? "text-amber-500" : "text-blue-400"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", avatar.role === 'manager' ? "bg-amber-500 animate-pulse" : "bg-blue-400")} />
                      {avatar.role === 'manager' ? t('security.role_manager') : t('security.role_resident')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeAvatar(avatar.id, avatar.avatar_key, avatar.avatar_name)}
                  className="w-14 h-14 flex items-center justify-center text-white/20 hover:text-white hover:bg-red-500/80 rounded-2xl transition-all border border-white/5 hover:border-red-400/50 shadow-lg active:scale-90 group/del"
                  title="Remover Acesso"
                  disabled={loading}
                >
                  <Trash2 size={22} className={cn("group-hover/del:scale-110 transition-transform", loading && "animate-pulse")} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <AddAvatarForm
          casperletId={selectedParcelId!}
          residentUuid={residentUuid!}
          onClose={() => setShowAddForm(false)}
          onSuccess={(newAvatar) => {
            setAvatars(prev => [newAvatar, ...prev]);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}
