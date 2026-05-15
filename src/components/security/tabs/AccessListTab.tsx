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
    
    // Find avatar to check role
    const avatar = avatars.find(a => a.id === id);
    if (avatar?.role === 'manager') {
      const confirmed = window.confirm(t('security.confirm_remove_manager', 'This avatar is a manager. Removing it will also revoke manager permissions and orb access. Continue?'));
      if (!confirmed) return;
    }
    
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder={t('team.placeholder_name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[11px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-wider"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Add Avatar</span>
        </button>
      </div>

      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 animate-pulse rounded-lg" />
          ))
        ) : filteredAvatars.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-white/10 uppercase font-black text-[10px] tracking-[0.3em] bg-white/[0.01]">
            {t('security.no_avatars')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className="group flex items-center justify-between p-2 sm:p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    avatar.role === 'manager' 
                      ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20" 
                      : "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
                  )}>
                    {avatar.role === 'manager' ? <ShieldCheck size={14} /> : <User size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-amber-500 transition-colors truncate">
                        {avatar.avatar_name}
                      </h4>
                      {avatar.role === 'manager' && (
                        <span className="px-1 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-500 text-[6px] font-black uppercase tracking-widest border border-amber-500/10">
                          Manager
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] font-mono text-white/20 select-all truncate uppercase tracking-tighter">
                      {avatar.avatar_key}
                    </p>
                  </div>
                </div>

                {avatar.role === 'manager' ? (
                  <div 
                    className="p-2 text-amber-500/30 cursor-help"
                    title={t('security.manager_locked_info', 'Managers can only be changed by admin')}
                  >
                    <ShieldCheck size={14} />
                  </div>
                ) : (
                  <button
                    onClick={() => removeAvatar(avatar.id, avatar.avatar_key, avatar.avatar_name)}
                    className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                    title="Remover Acesso"
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
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
