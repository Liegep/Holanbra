import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Trash2,
  Plus,
  X,
  Search,
  Key,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AdminResidentsProps {
  renters: any[];
  properties: any[];
  allPropertyTenants: any[];
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
  allPropertyTenants,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRenterFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const openForm = (renter?: any) => {
    if (renter) {
      setEditingRenterId(renter.id);
      setRenterFormData({
        avatarName: renter.avatar_name,
        avatarUuid: renter.avatar_uuid,
        password: renter.password
      });
      const id = renter.avatar_uuid;
      // Filter by properties.tenant_id OR property_tenants.tenant_id
      const assignedIds = properties
        .filter(p => (p.tenant_id === id) || allPropertyTenants.some(t => t.property_id === p.id && t.tenant_id === id))
        .map(p => p.id);
      setSelectedPropertyIds(assignedIds);
    } else {
      setEditingRenterId(null);
      setRenterFormData({ avatarName: '', avatarUuid: '', password: '' });
      setSelectedPropertyIds([]);
    }
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingRenterId(null);
    setRenterFormData({ avatarName: '', avatarUuid: '', password: '' });
    setSelectedPropertyIds([]);
  };

  const handleSaveAndClose = async () => {
    await handleSaveRenter();
    // handleSaveRenter in AdminArea already clears state, but we need to close our modal
    setIsModalOpen(false);
  };

  const filteredRenters = renters.filter(r => 
    r.avatar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.avatar_uuid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-8">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h3 className="text-2xl font-bold font-display text-white">{t('admin.residents.title')}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">{t('admin.residents.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text"
              placeholder={t('admin.common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shrink-0"
          >
            <Plus size={14} />
            {t('admin.residents.register_button')}
          </button>
        </div>
      </div>

      {/* Residents Table */}
      <div className="glass-card border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">{t('admin.fields.name')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">{t('admin.fields.tenant_uuid', 'UUID')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest">{t('admin.residents.password')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-white/40 tracking-widest text-right">{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRenters.map((renter) => (
                <tr key={renter.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 bg-black shrink-0">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(renter.avatar_name)}&background=111111&color=f59e0b&size=100&bold=true&format=svg`} 
                          alt={renter.avatar_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{renter.avatar_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-white/30">{renter.avatar_uuid}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-amber-500/80 font-mono text-xs">
                      <Key size={10} className="text-amber-500/40" />
                      {renter.password}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openForm(renter)}
                        className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title={t('admin.common.edit')}
                      >
                        <Settings size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRenter(renter.id, renter.avatar_uuid)}
                        className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title={t('admin.common.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRenters.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/20 uppercase text-[10px] font-bold tracking-widest">
                    {t('admin.common.no_items')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h4 className="text-xl font-bold text-white font-display">
                    {editingRenterId ? t('admin.residents.update_button') : t('admin.residents.register_button')}
                  </h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                    {editingRenterId ? t('admin.residents.subtitle') : t('admin.residents.subtitle')}
                  </p>
                </div>
                <button 
                  onClick={closeForm}
                  className="p-2 text-white/20 hover:text-white rounded-full hover:bg-white/5 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.fields.name')}</label>
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.fields.tenant_uuid', 'Avatar UUID')}</label>
                    <input 
                      type="text" 
                      name="avatarUuid"
                      value={renterFormData.avatarUuid}
                      onChange={handleRenterInputChange}
                      disabled={!!editingRenterId}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                  </div>
                  <div className="space-y-2 text-left md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.residents.password')}</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="text" 
                        name="password"
                        value={renterFormData.password}
                        onChange={handleRenterInputChange}
                        className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
                        placeholder="Secret Key"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Assignment */}
                <div className="space-y-4 text-left border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Home size={14} className="text-amber-500" />
                      <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t('admin.residents.assign_properties')}</label>
                    </div>
                    <span className="text-[9px] text-white/30 uppercase">{selectedPropertyIds.length} {t('admin.residents.selected_count')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {properties.map(prop => {
                      const isSelected = selectedPropertyIds.includes(prop.id);
                      const isOccupiedByOthers = prop.tenant_id && prop.tenant_id !== renterFormData.avatarUuid;
                      
                      return (
                        <button
                          key={prop.id}
                          onClick={() => {
                            if (isOccupiedByOthers) return;
                            setSelectedPropertyIds(prev => 
                              prev.includes(prop.id) 
                                ? prev.filter(id => id !== prop.id) 
                                : [...prev, prop.id]
                            );
                          }}
                          disabled={isOccupiedByOthers}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 text-white"
                              : isOccupiedByOthers
                                ? "bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed"
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 relative">
                            <img src={prop.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {isOccupiedByOthers && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[6px] font-black uppercase text-white/50 tracking-tighter">{t('admin.residents.occupied')}</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className={cn("text-[10px] font-bold truncate", isSelected ? "text-amber-500" : "text-white")}>{prop.name}</p>
                              {prop.tenant_id && isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <p className="text-[8px] font-mono text-white/30 truncate">L$ {prop.price}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button 
                  onClick={closeForm}
                  className="px-6 py-3 rounded-xl border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white/5 transition-all"
                >
                  {t('admin.common.cancel')}
                </button>
                <button 
                  onClick={handleSaveAndClose}
                  className="px-8 py-3 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                >
                  {editingRenterId ? t('admin.residents.update_button') : t('admin.residents.register_button')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
