import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Search, MapPin, User, Loader2, AlertCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import Toast, { ToastType } from '../Toast';

interface Property {
  id: string;
  name: string;
  casperlet_id: string;
}

interface Manager {
  id: string;
  avatar_name: string;
  avatar_key: string;
  role: string;
  created_at: string;
}

export function AdminSecurityManagers() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProperties, setFetchingProperties] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [managerFormData, setManagerFormData] = useState({
    avatarName: '',
    avatarKey: ''
  });
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchManagers(selectedProperty.casperlet_id);
    } else {
      setManagers([]);
    }
  }, [selectedProperty]);

  const fetchProperties = async () => {
    setFetchingProperties(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, casperlet_id')
        .order('name');
      
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      showToast('Error loading properties', 'error');
    } finally {
      setFetchingProperties(false);
    }
  };

  const fetchManagers = async (parcelId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/security/admin/managers?parcel_id=' + parcelId, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setManagers(result.data || []);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error('Error fetching managers:', err);
      showToast(err.message || 'Error loading managers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) {
      showToast('Property is required', 'info');
      return;
    }
    if (!managerFormData.avatarName) {
      showToast('Avatar Name is required', 'info');
      return;
    }
    if (!managerFormData.avatarKey) {
      showToast('Avatar UUID is required', 'info');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/security/admin/managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          parcel_id: selectedProperty.casperlet_id,
          avatar_name: managerFormData.avatarName,
          avatar_key: managerFormData.avatarKey
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Manager added');
        setManagerFormData({ avatarName: '', avatarKey: '' });
        fetchManagers(selectedProperty.casperlet_id);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      showToast(err.message || 'Error adding manager', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManager = async (avatarKey: string) => {
    if (!selectedProperty || !confirm('Are you sure you want to remove this manager?')) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/security/admin/managers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          parcel_id: selectedProperty.casperlet_id,
          avatar_key: avatarKey
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Manager removed');
        fetchManagers(selectedProperty.casperlet_id);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      showToast(err.message || 'Error removing manager', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.casperlet_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Security Orb Managers</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] mt-1">Manage administrative access for security systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Properties List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 h-[600px] flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <MapPin size={14} />
              Properties
            </h2>
            
            <div className="relative group mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Find property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[11px] font-medium text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-wider"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2 no-scrollbar">
              {fetchingProperties ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="text-amber-500 animate-spin" size={24} />
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Loading properties</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                  <AlertCircle size={32} />
                  <p className="text-[10px] uppercase font-black tracking-widest">No properties found</p>
                </div>
              ) : (
                filteredProperties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProperty(p)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all border group",
                      selectedProperty?.id === p.id 
                        ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20" 
                        : "bg-white/[0.02] border-white/5 text-white hover:bg-white/5"
                    )}
                  >
                    <h3 className="text-xs font-black uppercase tracking-wider truncate">{p.name}</h3>
                    <p className={cn(
                      "text-[9px] font-mono mt-1 truncate",
                      selectedProperty?.id === p.id ? "text-black/60" : "text-white/20"
                    )}>
                      {p.casperlet_id}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Managers Management */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedProperty ? (
            <div className="bg-zinc-900/50 border border-dashed border-white/10 rounded-3xl p-12 h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Shield size={32} className="text-white/20" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Select a property</h2>
              <p className="text-white/40 uppercase tracking-widest text-[10px] mt-2">Select a property from the list to manage its security managers</p>
            </div>
          ) : (
            <>
              {/* Add Manager Form */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <Plus size={14} />
                  Add New Manager
                </h2>
                <form onSubmit={handleAddManager} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Avatar Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Resident"
                      value={managerFormData.avatarName}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, avatarName: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-[11px] font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-wider"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Avatar UUID</label>
                    <input
                      type="text"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      value={managerFormData.avatarKey}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, avatarKey: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all tracking-wider"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/10 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                      Add Manager
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Managers List */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Users size={14} />
                    Current Managers
                  </h2>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                    {managers.length} Configured
                  </span>
                </div>

                <div className="space-y-2">
                  {loading && managers.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                  ) : managers.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/20">
                      <Shield size={24} className="mb-3 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No managers configured</p>
                    </div>
                  ) : (
                    managers.map((manager) => (
                      <div
                        key={manager.avatar_key}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                            <User size={18} className="text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate">{manager.avatar_name}</h4>
                            <p className="text-[9px] font-mono text-white/20 truncate mt-0.5">{manager.avatar_key}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <div className="hidden sm:flex flex-col items-end mr-4">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Added on</span>
                            <span className="text-[9px] text-white/40 font-bold">{new Date(manager.created_at).toLocaleDateString()}</span>
                           </div>
                          <button
                            onClick={() => handleRemoveManager(manager.avatar_key)}
                            disabled={loading}
                            className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                            title="Remove Manager"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
