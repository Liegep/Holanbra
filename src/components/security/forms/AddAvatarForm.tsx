import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface AddAvatarFormProps {
  casperletId: string;
  residentUuid: string;
  onClose: () => void;
  onSuccess: (newAvatar: any) => void;
}

export function AddAvatarForm({ casperletId, residentUuid, onClose, onSuccess }: AddAvatarFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');
  const [role, setRole] = useState<'manager' | 'resident'>('resident');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUuid = uuid.trim();
    if (!trimmedUuid) {
      setError('Avatar UUID is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "add",
          parcel_id: casperletId,
          resident_uuid: residentUuid,
          avatar_name: name.trim(),
          avatar_key: trimmedUuid,
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.data);
      } else {
        setError(data.error || 'Error adding avatar');
      }
    } catch (err) {
      setError('Connection error');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-xs bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-3 border-b border-white/5 flex items-center justify-between bg-zinc-800/50">
          <h3 className="text-[10px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-2 px-1">
            <UserPlus size={12} className="text-amber-500" />
            {t('security.add_avatar')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md text-white/40 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider text-center">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-widest px-1">
                {t('common.name')}
              </label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Avatar Resident"
                className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[11px] text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 transition-all font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-widest px-1">
                UUID
              </label>
              <input
                required
                value={uuid}
                onChange={e => setUuid(e.target.value)}
                placeholder="00000000-0000..."
                className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 transition-all truncate"
              />
            </div>

            <div className="px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-500 text-black flex items-center justify-center">
                <User size={14} />
              </div>
              <div className="space-y-0 text-left">
                <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">
                  {t('security.role_resident')}
                </div>
                <div className="text-[7px] font-bold text-white/20 uppercase tracking-tight mt-0.5">
                  Regular access entry
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <UserPlus size={14} />}
            {t('security.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
}
