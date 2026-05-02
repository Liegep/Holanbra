import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  RefreshCw, 
  User as UserIcon, 
  Tag, 
  ShieldCheck, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface AdminSupportTicketsProps {
  tickets: any[];
  onRefresh: () => void;
  replyingTicketId: string | null;
  setReplyingTicketId: (id: string | null) => void;
  adminResponse: string;
  setAdminResponse: (val: string) => void;
  isSubmittingResponse: boolean;
  handleResolveTicket: (id: string) => void;
  handleSendResponse: (id: string) => void;
  stats: any;
}

export function AdminSupportTickets({
  tickets,
  onRefresh,
  replyingTicketId,
  setReplyingTicketId,
  adminResponse,
  setAdminResponse,
  isSubmittingResponse,
  handleResolveTicket,
  handleSendResponse,
  stats
}: AdminSupportTicketsProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h3 className="text-2xl font-bold font-display text-white">{t('recent_tickets')}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">{t('manage_tickets_desc')}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{stats.openTickets} {t('open')}</span>
          </div>
          <button 
            onClick={onRefresh}
            className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tickets.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px]">
            <MessageSquare size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{t('no_tickets_found')}</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <motion.div 
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass-card p-0 overflow-hidden border-white/5 transition-all group",
                ticket.status === 'open' ? "ring-1 ring-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]" : "opacity-60"
              )}
            >
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                <div className="lg:w-64 p-8 space-y-6 shrink-0 bg-white/[0.02]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded",
                        ticket.status === 'open' ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                      )}>
                        {ticket.status === 'open' ? t('open') : t('resolved')}
                      </span>
                      <span className="text-[8px] text-white/20 font-mono tracking-tighter">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-500">
                        <UserIcon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ticket.avatar_name}</p>
                        <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter truncate">{ticket.user_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Tag size={12} className="text-amber-500/40" />
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{ticket.category}</span>
                    </div>
                  </div>

                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => setReplyingTicketId(replyingTicketId === ticket.id ? null : ticket.id)}
                      className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg"
                    >
                      {replyingTicketId === ticket.id ? t('cancel_reply') : t('reply_resolve')}
                    </button>
                  )}
                </div>

                <div className="flex-1 p-8 space-y-6">
                  <div className="space-y-2 text-left">
                    <h4 className="text-xl font-bold text-white tracking-tight">{ticket.subject}</h4>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <p className="text-sm text-white/80 leading-relaxed italic">"{ticket.message}"</p>
                    </div>
                  </div>

                  {ticket.admin_reply && (
                    <div className="pl-6 border-l-2 border-amber-500/30 space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-amber-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{t('official_response')}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{ticket.admin_reply}</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {replyingTicketId === ticket.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <textarea 
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            placeholder={t('type_response_placeholder')}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-amber-500 outline-none transition-all resize-none"
                            rows={4}
                          />
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="px-6 py-3 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                            >
                              {t('mark_resolved_no_reply')}
                            </button>
                            <button 
                              onClick={() => handleSendResponse(ticket.id)}
                              disabled={isSubmittingResponse || !adminResponse.trim()}
                              className="px-8 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                              {isSubmittingResponse ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                              {t('send_resolve')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
