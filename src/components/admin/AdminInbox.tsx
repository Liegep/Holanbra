import React from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  Trash2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface AdminInboxProps {
  inboxMessages: any[];
  onRefresh: () => void;
  handleToggleRead: (id: string, status: boolean) => void;
  handleDeleteMessage: (e: React.MouseEvent, id: string) => void;
}

export function AdminInbox({
  inboxMessages,
  onRefresh,
  handleToggleRead,
  handleDeleteMessage
}: AdminInboxProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h3 className="text-2xl font-bold font-display text-white italic">{t('admin.inbox.title')}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">{t('admin.inbox.subtitle')}</p>
        </div>
        <button 
          onClick={onRefresh}
          className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {inboxMessages.length > 0 ? (
          inboxMessages.map((msg) => (
            <motion.div 
              key={msg.id}
              id={`msg-${msg.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "glass-card p-8 border-white/5 group hover:border-amber-500/20 transition-all flex flex-col md:flex-row gap-6 items-start",
                msg.is_read && "opacity-40 grayscale-[0.5]"
              )}
            >
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black",
                  msg.is_read ? "bg-white/20 text-white/40" : "bg-amber-500"
                )}>
                  {msg.visitor_name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[8px] text-white/20 font-mono tracking-tighter">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex-1 space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-bold tracking-tight text-lg">
                        <span className="text-amber-500/40 text-[10px] uppercase font-black mr-2 tracking-tighter">Avatar:</span>
                        {msg.visitor_name}
                      </h4>
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 bg-amber-500 text-[8px] text-black font-black uppercase rounded-full">{t('admin.inbox.new_badge')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest">TO:</span>
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{msg.recipient_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleRead(msg.id, msg.is_read)}
                      title={msg.is_read ? t('admin.inbox.mark_unread') : t('admin.inbox.mark_read')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                        msg.is_read 
                          ? "bg-white/5 text-white/40 hover:bg-white/10" 
                          : "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                      )}
                    >
                      {msg.is_read ? <Mail size={14} /> : <CheckCircle size={14} />}
                      {!msg.is_read && <span>OK</span>}
                    </button>
                    <button 
                      onClick={(e) => handleDeleteMessage(e, msg.id)}
                      className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title={t('admin.common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                  "{msg.message}"
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Mail size={40} className="mx-auto text-white/5 mb-4" />
            <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">{t('admin.inbox.none_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
