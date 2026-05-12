import React, { useState } from 'react';
import { X, UserX, Gavel } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface AddBanFormProps {
  casperletId: string;
  residentUuid: string;
  onClose: () => void;
  onSuccess: (newBan: any) => void;
}

export function AddBanForm({ casperletId, residentUuid, onClose, onSuccess }: AddBanFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/security/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "ban",
          parcel_id: casperletId,
          resident_uuid: residentUuid,
          avatar_name: name.trim(),
          avatar_key: uuid.trim(),
          reason: "Manual ban"
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.data);
      } else {
        console.error('Error banning avatar:', data.error);
      }
    } catch (err) {
      console.error('Error banning avatar:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm bg-zinc-900 border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2 px-2">
            <UserX size={14} className="text-red-500" />
            {t('security.add_avatar')} (BAN)
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-red-500/50 transition-all font-medium"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-500 text-white hover:bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            <Gavel size={16} />
            {t('security.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
}
