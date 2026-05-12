import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface AddAvatarFormProps {
  casperletId: string;
  onClose: () => void;
  onSuccess: (newAvatar: any) => void;
}

export function AddAvatarForm({ casperletId, onClose, onSuccess }: AddAvatarFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');
  const [role, setRole] = useState<'manager' | 'resident'>('resident');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('security_access_list')
      .insert({
        casperlet_id: casperletId,
        avatar_name: name.trim(),
        avatar_key: uuid.trim(),
        role: role
      })
      .select()
      .single();

    if (!error && data) {
      onSuccess(data);
    } else {
      console.error('Error adding avatar:', error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2 px-2">
            <UserPlus size={14} className="text-amber-500" />
            {t('security.add_avatar')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                {t('common.name')}
              </label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Avatar Resident"
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest px-1">
                UUID
              </label>
              <input
                required
                value={uuid}
                onChange={e => setUuid(e.target.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 transition-all select-all whitespace-pre truncate"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('resident')}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  role === 'resident'
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-500 shadow-lg shadow-blue-500/10"
                    : "bg-transparent border-white/5 text-white/20 hover:text-white/40"
                )}
              >
                <User size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('security.role_resident')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  role === 'manager'
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-transparent border-white/5 text-white/20 hover:text-white/40"
                )}
              >
                <ShieldCheck size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('security.role_manager')}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <UserPlus size={16} />}
            {t('security.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
}
