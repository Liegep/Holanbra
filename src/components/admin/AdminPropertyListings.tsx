import React from 'react';
import { motion } from 'motion/react';
import { 
  RefreshCw, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Trash2, 
  ChevronRight,
  X,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface AdminPropertyListingsProps {
  properties: any[];
  stats: any;
  activeFilter: 'all' | 'expiring';
  setActiveFilter: (filter: 'all' | 'expiring') => void;
  filteredProperties: any[];
  setActiveTab: (tab: any) => void;
  handleEdit: (prop: any) => void;
  handleDelete: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

export function AdminPropertyListings({
  properties,
  stats,
  activeFilter,
  setActiveFilter,
  filteredProperties,
  setActiveTab,
  handleEdit,
  handleDelete,
  showToast
}: AdminPropertyListingsProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h3 className="text-4xl font-bold font-display tracking-tight text-left text-white">Executive Dashboard</h3>
            <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.3em] text-left">Operational overview of all virtual holdings and resident status</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white">
            <RefreshCw size={12} className="text-amber-500" />
            Sync Casperlet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 border-white/10 bg-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileText size={48} className="text-white" />
            </div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">Total Portfolio</p>
            <div className="text-5xl font-black text-white leading-none">{stats.total}</div>
            <p className="text-[9px] text-white/20 uppercase mt-4 tracking-tighter">Units across all Sims</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setActiveTab('tickets')}
            className={cn(
              "glass-card p-8 relative overflow-hidden transition-all duration-500 cursor-pointer group hover:scale-[1.02]",
              stats.openTickets > 0 ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/10 bg-white/5"
            )}
          >
            <div className={cn("absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity", stats.openTickets > 0 ? "text-amber-500" : "text-white")}>
              <MessageSquare size={48} />
            </div>
            <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.openTickets > 0 ? "text-amber-500" : "text-white/40")}>Open Support Tickets</p>
            <div className={cn("text-5xl font-black leading-none", stats.openTickets > 0 ? "text-amber-500" : "text-white")}>{stats.openTickets}</div>
            <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.openTickets > 0 ? "text-amber-500/40" : "text-white/20")}>{stats.totalTickets} Total tickets in database</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 border-amber-500/10 bg-amber-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle size={48} className="text-amber-500" />
            </div>
            <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest mb-4">Overall Occupancy</p>
            <div className="flex items-baseline gap-2">
               <div className="text-5xl font-black text-amber-500 leading-none">{Math.round((stats.rented / stats.total) * 100) || 0}%</div>
               <div className="text-xs font-bold text-amber-500/40">{stats.rented}/{stats.total}</div>
            </div>
            <p className="text-[9px] text-amber-500/20 uppercase mt-4 tracking-tighter">{stats.available} Available for rent</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "glass-card p-8 relative overflow-hidden transition-all duration-500",
              stats.critical > 0 ? "border-red-500/30 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "border-white/10 bg-white/5"
            )}
          >
            <div className={cn("absolute top-0 right-0 p-8 opacity-10", stats.critical > 0 ? "text-red-500" : "text-white")}>
              <AlertCircle size={48} />
            </div>
            <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.critical > 0 ? "text-red-500" : "text-white/40")}>Critical Expirations</p>
            <div className={cn("text-5xl font-black leading-none", stats.critical > 0 ? "text-red-500" : "text-white")}>{stats.critical}</div>
            <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.critical > 0 ? "text-red-500/40" : "text-white/20")}>Expiring within 72 hours</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "glass-card p-8 relative overflow-hidden transition-all duration-500",
              stats.attention > 0 ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/10 bg-white/5"
            )}
          >
            <div className={cn("absolute top-0 right-0 p-8 opacity-10", stats.attention > 0 ? "text-amber-500" : "text-white")}>
              <Clock size={48} />
            </div>
            <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.attention > 0 ? "text-amber-500" : "text-white/40")}>Priority Renewals</p>
            <div className={cn("text-5xl font-black leading-none", stats.attention > 0 ? "text-amber-500" : "text-white")}>{stats.attention}</div>
            <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.attention > 0 ? "text-amber-500/40" : "text-white/20")}>Expiring within 7 days</p>
          </motion.div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeFilter === 'all' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
              )}
            >
              All Properties ({properties.length})
            </button>
            <button 
              onClick={() => setActiveFilter('expiring')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeFilter === 'expiring' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/40 hover:text-red-400"
              )}
            >
              <Clock size={12} />
              Expiring Soon ({stats.critical + stats.attention})
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredProperties.map((prop) => {
            const daysRemaining = prop.expiry_date ? Math.ceil((new Date(prop.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            const isCritical = daysRemaining !== null && daysRemaining <= 3;
            const isAttention = daysRemaining !== null && daysRemaining > 3 && daysRemaining <= 7;

            return (
              <div 
                key={prop.id} 
                className={cn(
                  "glass-card p-4 flex items-center gap-4 group transition-all duration-300",
                  isCritical ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)] scale-[1.01]" : 
                  isAttention ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : 
                  "border-white/5"
                )}
              >
                <div className="w-20 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0">
                   <img src={prop.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm truncate text-white">{prop.name}</h4>
                    
                    {prop.property_type && prop.property_type.length > 0 && (
                      <div className="flex gap-1">
                        {prop.property_type.map((type: string) => (
                          <span 
                            key={type}
                            className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] text-white/40 uppercase font-bold"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}

                    {daysRemaining !== null && (
                      <div className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                        isCritical ? "bg-red-500 text-white" : isAttention ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                      )}>
                        <Clock size={8} />
                        {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
                      </div>
                    )}

                    {prop.casperlet_id && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] text-amber-500 font-black uppercase tracking-tighter shadow-sm">
                        <RefreshCw size={8} />
                        Synced
                      </div>
                    )}
                    {prop.tenant_name && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-[8px] text-blue-400 font-black uppercase tracking-tighter">
                          <UserIcon size={8} />
                          {prop.tenant_name}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter truncate">L$ {prop.rental_price || prop.price}</p>
                    {prop.expiry_date && (
                      <span className="text-[9px] text-gray-600 font-mono">
                        EXP: {new Date(prop.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-end gap-1">
                     <div className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        prop.status === 'available' ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/40"
                      )}>
                        {prop.status}
                     </div>
                   </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(prop)}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                      title="Edit Property"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button 
                      onClick={() => window.open(prop.teleport_url, '_blank')}
                      className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
                      title="Teleport to location"
                    >
                      <MapPin size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 text-red-500/30 hover:text-red-500 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {properties.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No properties registered</p>
          </div>
        )}
      </div>
    </div>
  );
}
