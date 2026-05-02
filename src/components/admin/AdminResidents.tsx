import React from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Trash2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface AdminResidentsProps {
  renters: any[];
  properties: any[];
  renterFormData: any;
  setRenterFormData: (val: any) => void;
  selectedPropertyIds: string[];
  setSelectedPropertyIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  editingRenterId: string | null;
  setEditingRenterId: (id: string | null) => void;
  handleSaveRenter: () => void;
  handleDeleteRenter: (id: string, uuid: string) => void;
}

export function AdminResidents({
  renters,
  properties,
  renterFormData,
  setRenterFormData,
  selectedPropertyIds,
  setSelectedPropertyIds,
  editingRenterId,
  setEditingRenterId,
  handleSaveRenter,
  handleDeleteRenter
}: AdminResidentsProps) {
  const { t } = useTranslation();

  const handleRenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRenterFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h3 className="text-2xl font-bold font-display text-white">{t('resident_management')}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">{t('manage_residents_desc')}</p>
        </div>
      </div>

      <div className="glass-card p-8 border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('avatar_name_sl')}</label>
            <input 
              type="text" 
              name="avatarName"
              value={renterFormData.avatarName}
              onChange={handleRenterInputChange}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
              placeholder="John Resident"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('avatar_uuid')}</label>
            <input 
              type="text" 
              name="avatarUuid"
              value={renterFormData.avatarUuid}
              onChange={handleRenterInputChange}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('login_password')}</label>
            <input 
              type="text" 
              name="password"
              value={renterFormData.password}
              onChange={handleRenterInputChange}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
              placeholder="Secret Key"
            />
          </div>
        </div>

        <div className="space-y-4 text-left border-t border-white/5 pt-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t('assign_properties')}</label>
            <span className="text-[9px] text-white/30 uppercase">{selectedPropertyIds.length} {t('selected_count')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map(prop => (
              <button
                key={prop.id}
                onClick={() => {
                  setSelectedPropertyIds(prev => 
                    prev.includes(prop.id) 
                      ? prev.filter(id => id !== prop.id) 
                      : [...prev, prop.id]
                  );
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  selectedPropertyIds.includes(prop.id)
                    ? "bg-amber-500/10 border-amber-500 text-white"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 shrink-0 relative">
                  <img src={prop.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {prop.status !== 'available' && !selectedPropertyIds.includes(prop.id) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[6px] font-black uppercase text-white/50 tracking-tighter">{t('occupied')}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-bold truncate">{prop.name}</p>
                    {prop.tenant_id && !selectedPropertyIds.includes(prop.id) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`Occupied by ${prop.tenant_name}`} />
                    )}
                  </div>
                  <p className="text-[8px] font-mono text-amber-500/60 truncate">L$ {prop.price}</p>
                </div>
              </button>
            ))}
            {properties.length === 0 && (
              <p className="text-[10px] text-white/20 uppercase py-4">No properties registered</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          {renterFormData.avatarUuid && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#f59e0b] bg-zinc-900">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(renterFormData.avatarName || 'SL')}&background=111111&color=f59e0b&size=200&bold=true&format=svg`} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-bold uppercase text-amber-500/60">{t('sl_profile_preview')}</span>
            </div>
          )}
          <div className="flex gap-4">
            {editingRenterId && (
              <button 
                onClick={() => { 
                  setEditingRenterId(null); 
                  setRenterFormData({ avatarName: '', avatarUuid: '', password: '' }); 
                  setSelectedPropertyIds([]);
                }}
                className="px-6 py-3 rounded-xl border border-white/10 text-white text-[10px] font-bold uppercase"
              >
                {t('cancel')}
              </button>
            )}
            <button 
              onClick={handleSaveRenter}
              className="px-8 py-3 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
            >
              {editingRenterId ? t('update_resident') : t('register_resident')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renters.map((renter) => (
          <div key={renter.id} className="glass-card p-6 border-white/5 hover:border-amber-500/30 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#f59e0b] bg-zinc-900">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(renter.avatar_name)}&background=111111&color=f59e0b&size=200&bold=true&format=svg`} 
                  alt={renter.avatar_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left min-w-0">
                <h4 className="font-bold text-white truncate">{renter.avatar_name}</h4>
                <p className="text-[9px] text-white/30 font-mono truncate">{renter.avatar_uuid}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center bg-black/20 p-2 rounded-lg">
              <div className="text-left">
                <span className="text-[8px] uppercase text-gray-500 font-bold block">{t('admin.password')}</span>
                <span className="text-[10px] text-amber-500/80 font-mono">{renter.password}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingRenterId(renter.id);
                    setRenterFormData({
                      avatarName: renter.avatar_name,
                      avatarUuid: renter.avatar_uuid,
                      password: renter.password
                    });
                    const id = renter.tenant_id || renter.avatar_uuid;
                    const assignedIds = properties
                      .filter(p => (p.tenant_id === id))
                      .map(p => p.id);
                    setSelectedPropertyIds(assignedIds);
                  }}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <Settings size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteRenter(renter.id, renter.avatar_uuid)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
