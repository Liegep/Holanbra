import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  RefreshCw, 
  User as UserIcon, 
  Tag, 
  ShieldCheck, 
  CheckCircle, 
  Loader2,
  Trash2
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
  handleResolveTicket: (id: string, currentStatus: string) => void;
  handleSendResponse: (id: string, resolve?: boolean) => void;
  handleDeleteTicket: (e: React.MouseEvent, id: string) => void;
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
  handleDeleteTicket,
  stats
}: AdminSupportTicketsProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h3 className="text-2xl font-bold font-display text-white">{t('admin.tickets.title')}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">{t('admin.tickets.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{stats.openTickets} {t('admin.tickets.status_open')}</span>
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
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{t('admin.tickets.none_found')}</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <motion.div 
              key={ticket.id}
              id={`ticket-${ticket.id}`}
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
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded",
                          ticket.status === 'open' ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-white/10 text-white/40"
                        )}>
                          {ticket.status === 'open' ? t('admin.tickets.status_open') : t('admin.tickets.status_resolved')}
                        </span>
                        {ticket.status === 'open' && !ticket.admin_reply && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-red-500 text-white animate-pulse rounded shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            Action Required
                          </span>
                        )}
                        {ticket.status === 'open' && ticket.admin_reply && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded">
                            Follow-up Needed
                          </span>
                        )}
                        <button 
                          onClick={(e) => handleDeleteTicket(e, ticket.id)}
                          className="p-1 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title={t('admin.tickets.delete_title')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
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

                  {ticket.status === 'resolved' ? (
                    <button 
                      onClick={() => handleResolveTicket(ticket.id, ticket.status)}
                      className="w-full py-3 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-blue-500/20"
                    >
                      <RefreshCw size={12} className="inline mr-2" /> {t('admin.tickets.reopen')}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button 
                        onClick={() => setReplyingTicketId(replyingTicketId === ticket.id ? null : ticket.id)}
                        className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg"
                      >
                        {replyingTicketId === ticket.id ? t('admin.common.cancel') : t('admin.tickets.reply_resolve', 'Reply / Resolve')}
                      </button>
                      <button 
                        onClick={() => handleResolveTicket(ticket.id, ticket.status)}
                        className="w-full py-2 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 hover:text-white transition-all"
                      >
                        {t('admin.tickets.resolve_only')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 space-y-8">
                  <div className="space-y-4 text-left">
                    <h4 className="text-xl font-bold text-white tracking-tight">{ticket.subject}</h4>
                    
                    <div className="space-y-4">
                      {/* Message History */}
                      {(() => {
                        const parseMessages = (text: string) => {
                          if (!text) return [];
                          const parts = text.split(/--- Follow-up (.*?) ---/);
                          const result = [];
                          result.push({ text: parts[0]?.trim() || '', date: null, isFollowUp: false });
                          for (let i = 1; i < parts.length; i += 2) {
                            if (parts[i] && parts[i+1]) {
                              result.push({ text: parts[i+1]?.trim() || '', date: parts[i]?.trim(), isFollowUp: true });
                            }
                          }
                          return result.filter(m => m.text);
                        };
                        
                        const messages = parseMessages(ticket.message || '');
                        return messages.map((m, idx) => (
                          <div key={idx} className={cn(
                            "p-6 rounded-2xl border transition-all",
                            m.isFollowUp ? "bg-white/[0.03] border-white/5 ml-4" : "bg-white/5 border-white/10 shadow-lg shadow-black/20"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60">
                                {m.isFollowUp ? `FOLLOW-UP ${m.date || ''}` : 'ORIGINAL REQUEST'}
                              </span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                              {m.text.startsWith('"') && m.text.endsWith('"') ? m.text.slice(1, -1) : m.text}
                            </p>
                          </div>
                        ));
                      })()}

                      {/* Admin Responses */}
                      {ticket.admin_reply && (
                        <div className="p-6 rounded-2xl border bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                          <div className="flex items-center gap-2 mb-3 relative z-10">
                            <ShieldCheck className="text-amber-500" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{t('admin.tickets.official_response')}</span>
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed relative z-10 whitespace-pre-wrap">{ticket.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>

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
                            placeholder={t('admin.tickets.placeholder_reply')}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-amber-500 outline-none transition-all resize-none"
                            rows={4}
                          />
                          <div className="flex justify-end gap-3 font-display">
                            <button 
                              onClick={() => handleSendResponse(ticket.id, false)}
                              disabled={isSubmittingResponse || !adminResponse.trim()}
                              className="px-6 py-3 bg-white/5 text-white/80 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2"
                            >
                              {isSubmittingResponse ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                              Reply Only
                            </button>
                            <button 
                              onClick={() => handleSendResponse(ticket.id, true)}
                              disabled={isSubmittingResponse || !adminResponse.trim()}
                              className="px-8 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                              {isSubmittingResponse ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                              {t('admin.tickets.send_resolve')}
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
