import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  MapPin, 
  Hash,
  Search,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface DecorationOrder {
  id: string;
  created_at: string;
  package_name: string;
  customer_name: string;
  discord_id: string | null;
  region_name: string | null;
  environments: string | null;
  style: string | null;
  prims_available: string | null;
  deadline: string | null;
  details: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

interface AdminDecorationOrdersProps {
  orders: DecorationOrder[];
  onRefresh: () => void;
}

export const AdminDecorationOrders: React.FC<AdminDecorationOrdersProps> = ({ orders, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.region_name && order.region_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.style && order.style.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.environments && order.environments.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('decoration_orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const { error } = await supabase
        .from('decoration_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div id="admin-decoration-orders" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            Decoration Orders
          </h2>
          <p className="text-gray-400 text-sm">Manage quote requests for decoration packages</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              id="search-orders-input"
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl self-start w-fit border border-white/5">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            id={`filter-tab-${tab}`}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              filter === tab ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all shadow-xl shadow-black/20"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white tracking-tight">{order.customer_name}</h3>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border", getStatusColor(order.status))}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                            <span className="flex items-center gap-1.5 shrink-0">
                              <Calendar size={12} className="text-amber-500/50" />
                              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                            <span className="flex items-center gap-1.5 min-w-0">
                              <Hash size={12} className="text-amber-500/50" />
                              <span className="truncate">{order.package_name}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.discord_id && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <MessageSquare size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Discord</p>
                              <p className="truncate font-mono">{order.discord_id}</p>
                            </div>
                          </div>
                        )}
                        {order.region_name && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <MapPin size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Region/Sim</p>
                              <p className="truncate font-mono">{order.region_name}</p>
                            </div>
                          </div>
                        )}
                        {order.environments && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <MapPin size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Environments</p>
                              <p className="truncate font-mono">{order.environments}</p>
                            </div>
                          </div>
                        )}
                        {order.style && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <Sparkles size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Style</p>
                              <p className="truncate font-mono">{order.style}</p>
                            </div>
                          </div>
                        )}
                        {order.prims_available && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <Hash size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Prims Available</p>
                              <p className="truncate font-mono">{order.prims_available}</p>
                            </div>
                          </div>
                        )}
                        {order.deadline && (
                          <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/3 p-3 rounded-xl border border-white/5">
                            <Calendar size={16} className="text-amber-500" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Deadline</p>
                              <p className="truncate font-mono">{order.deadline}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/3 p-4 rounded-xl space-y-2 border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Project Details</p>
                        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed italic border-l-2 border-amber-500/30 pl-3 py-1">
                          "{order.details}"
                        </p>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="md:w-48 flex flex-col gap-2 shrink-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase px-2 mb-1 tracking-widest">Update Status</p>
                      
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                        disabled={order.status === 'pending' || updatingId === order.id}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                          order.status === 'pending' 
                            ? "bg-amber-500 text-black border-amber-500" 
                            : "bg-white/5 text-gray-400 border-white/10 hover:border-amber-500/50 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          Pending
                        </div>
                        {order.status === 'pending' && <CheckCircle2 size={12} />}
                      </button>

                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                        disabled={order.status === 'in_progress' || updatingId === order.id}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                          order.status === 'in_progress' 
                            ? "bg-blue-500 text-black border-blue-500" 
                            : "bg-white/5 text-gray-400 border-white/10 hover:border-blue-500/50 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight size={14} />
                          In Progress
                        </div>
                        {order.status === 'in_progress' && <CheckCircle2 size={12} />}
                      </button>

                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        disabled={order.status === 'completed' || updatingId === order.id}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                          order.status === 'completed' 
                            ? "bg-green-500 text-black border-green-500" 
                            : "bg-white/5 text-gray-400 border-white/10 hover:border-green-500/50 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Completed
                        </div>
                        {order.status === 'completed' && <CheckCircle2 size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center space-y-4 bg-white/5 rounded-[40px] border border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                <Sparkles size={32} />
              </div>
              <div>
                <p className="text-white font-bold">No orders found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
