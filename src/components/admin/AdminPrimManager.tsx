import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Search, 
  Filter, 
  History, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import Toast, { ToastType } from '../Toast';

interface PrimResident {
  id: number;
  resident_key: string;
  resident_name: string;
  prims_used: number;
  prim_limit: number;
  last_seen: string | null;
  created_at: string;
}

interface PrimHistory {
  id: number;
  resident_key: string;
  resident_name: string;
  prims_used: number;
  prim_limit: number;
  over_limit: boolean;
  recorded_at: string;
}

export const AdminPrimManager: React.FC = () => {
  const { t } = useTranslation();
  const [residents, setResidents] = useState<PrimResident[]>([]);
  const [history, setHistory] = useState<PrimHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'over'>('all');
  const [activeView, setActiveView] = useState<'current' | 'history'>('current');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newLimit, setNewLimit] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resData, error: resError } = await supabase
        .from('prim_residents')
        .select('*')
        .order('resident_name');
      
      if (resError) throw resError;
      setResidents(resData || []);

      const { data: histData, error: histError } = await supabase
        .from('prim_history')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);
      
      if (histError) throw histError;
      setHistory(histData || []);
    } catch (err: any) {
      console.error('Error fetching prim data:', err);
      // We don't alert here because tables might not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channelRes = supabase.channel('prim_residents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prim_residents' }, fetchData)
      .subscribe();

    const channelHist = supabase.channel('prim_history_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prim_history' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channelRes);
      supabase.removeChannel(channelHist);
    };
  }, []);

  const handleUpdateLimit = async (id: number, currentName: string) => {
    try {
      const limitVal = parseInt(newLimit);
      if (isNaN(limitVal)) {
        showToast("Invalid limit", "error");
        return;
      }

      const { error } = await supabase
        .from('prim_residents')
        .update({ prim_limit: limitVal })
        .eq('id', id);

      if (error) throw error;
      
      showToast("Limit updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      showToast("Error updating limit: " + err.message, "error");
    }
  };

  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'over' && r.prim_limit > 0 && r.prims_used > r.prim_limit);
    return matchesSearch && matchesFilter;
  });

  const overLimitCount = residents.filter(r => r.prim_limit > 0 && r.prims_used > r.prim_limit).length;

  return (
    <div className="space-y-8 pb-20">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Residents</h3>
              <p className="text-2xl font-black text-white">{residents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              overLimitCount > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Over Limit</h3>
              <p className={cn(
                "text-2xl font-black",
                overLimitCount > 0 ? "text-red-500" : "text-emerald-500"
              )}>{overLimitCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Box size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Prims Used</h3>
              <p className="text-2xl font-black text-white">
                {residents.reduce((acc, curr) => acc + curr.prims_used, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 self-start">
          <button
            onClick={() => setActiveView('current')}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeView === 'current' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
            )}
          >
            Current Status
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeView === 'history' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
            )}
          >
            History Log
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search resident..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all w-full md:w-64"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white outline-none focus:border-amber-500/50 transition-all font-bold"
          >
            <option value="all">All Residents</option>
            <option value="over">Over Limit Only</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-black/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl">
        {activeView === 'current' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40">Resident</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Prims Used</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Limit</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Status</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Last Check</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8 px-8">
                        <div className="h-4 bg-white/5 rounded-full w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white/20 italic">
                      No residents found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((res) => {
                    const isOver = res.prim_limit > 0 && res.prims_used > res.prim_limit;
                    const usagePercent = res.prim_limit > 0 ? Math.min((res.prims_used / res.prim_limit) * 100, 100) : 0;

                    return (
                      <motion.tr 
                        key={res.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-8 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                              <UserIcon size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-white mb-1">{res.resident_name}</p>
                              <p className="text-[10px] font-mono text-white/20 uppercase">{res.resident_key.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-8">
                          <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <span className={cn("text-lg font-black", isOver ? "text-red-500" : "text-white")}>
                              {res.prims_used}
                            </span>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercent}%` }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  isOver ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-emerald-500"
                                )}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-8">
                          <div className="flex justify-center items-center">
                            {editingId === res.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={newLimit}
                                  onChange={(e) => setNewLimit(e.target.value)}
                                  className="w-20 bg-white/10 border border-amber-500/50 rounded-lg py-1 px-2 text-white text-xs font-bold outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateLimit(res.id, res.resident_name)}
                                  className="text-emerald-500 hover:scale-110 transition-transform"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-white/40 hover:text-white"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/limit">
                                <span className="font-bold text-white/60">
                                  {res.prim_limit || 'No limit set'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingId(res.id);
                                    setNewLimit(res.prim_limit.toString());
                                  }}
                                  className="opacity-0 group-hover/limit:opacity-100 text-white/20 hover:text-amber-500 transition-all"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-8 px-8">
                          <div className="flex justify-center">
                            {res.prim_limit === 0 ? (
                              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase text-white/40">Not Managed</span>
                            ) : isOver ? (
                              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-500 flex items-center gap-2">
                                <TrendingUp size={10} /> Over Limit
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 size={10} /> OK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-8 px-8 text-right">
                          <p className="text-sm font-bold text-white/60">
                            {res.last_seen ? new Date(res.last_seen).toLocaleDateString() : 'Never'}
                          </p>
                          <p className="text-[10px] font-black uppercase text-white/20">
                            {res.last_seen ? new Date(res.last_seen).toLocaleTimeString() : '-'}
                          </p>
                        </td>
                        <td className="py-8 px-8 text-right">
                          <button 
                            onClick={() => {
                              setActiveView('history');
                              setSearchTerm(res.resident_name);
                            }}
                            className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
                          >
                            <History size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40">Timestamp</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40">Resident</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Usage</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Limit</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-white/20 italic">
                      No history records yet. Touch the prim checker in-world to sync data.
                    </td>
                  </tr>
                ) : (
                  history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-white/60">{new Date(entry.recorded_at).toLocaleDateString()}</p>
                        <p className="text-[10px] font-black uppercase text-white/20">{new Date(entry.recorded_at).toLocaleTimeString()}</p>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            entry.over_limit ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40"
                          )}>
                            <History size={14} />
                          </div>
                          <span className="font-bold text-white">{entry.resident_name}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center">
                        <span className={cn("font-black text-lg", entry.over_limit ? "text-red-500" : "text-white")}>
                          {entry.prims_used}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-center">
                        <span className="font-bold text-white/40">{entry.prim_limit || '-'}</span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        {entry.over_limit ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-500">
                            <TrendingUp size={10} /> Over Limit
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-500">
                            <TrendingDown size={10} /> Within Limit
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="bg-amber-500 rounded-[40px] p-12 text-black relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-black/10 flex items-center justify-center">
            <RefreshCw size={32} />
          </div>
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-tight mb-4">Real-time Integration</h2>
            <p className="text-lg font-medium text-black/70 leading-relaxed mb-8">
              Sync your land prims automatically using our LSL script. The system allows you to monitor residents and alerts you instantly when someone exceeds their limit.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.open('https://github.com/your-repo/prim-checker', '_blank')}
                className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:translate-y-[-2px] transition-all shadow-2xl"
              >
                Copy LSL Script
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
