import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Shield, Layout, UserPlus, Home, Scroll, LifeBuoy, ChevronLeft, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

type ChatState = 'idle' | 'menu' | 'security' | 'prims' | 'rentals' | 'rules' | 'contact_esc' | 'invite_prompt' | 'invite_sent';

export default function SupportChat() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [uuid, setUuid] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Tawk.to
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();

    // @ts-ignore
    window.Tawk_API.onLoad = function() {
      // @ts-ignore
      window.Tawk_API.hideWidget();
      setIsTawkLoaded(true);
    };

    (function(){
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69f4c78fb402371c38a67bb1/1jni2n33k';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    })();
  }, []);

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatState('menu');
    }
  };

  const openTawk = () => {
    // @ts-ignore
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      // @ts-ignore
      window.Tawk_API.showWidget();
      // @ts-ignore
      window.Tawk_API.maximize();
      setIsOpen(false);
    }
  };

  const handleInvite = async () => {
    if (!uuid || uuid.length < 32) return;
    
    setIsSendingInvite(true);
    try {
      const response = await fetch('/api/smartbots/group-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_uuid: uuid })
      });
      const data = await response.json();
      setInviteResult({ 
        success: data.success, 
        message: data.success ? t('support.responses.invite_success') : t('support.responses.invite_error') 
      });
      setChatState('invite_sent');
    } catch (error) {
      setInviteResult({ success: false, message: t('support.responses.invite_error') });
      setChatState('invite_sent');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const menuItems = [
    { id: 'security', label: t('support.menu.security'), icon: Shield },
    { id: 'prims', label: t('support.menu.prims'), icon: Layout },
    { id: 'invite_prompt', label: t('support.menu.invite'), icon: UserPlus },
    { id: 'rentals', label: t('support.menu.rentals'), icon: Home },
    { id: 'rules', label: t('support.menu.rules'), icon: Scroll },
    { id: 'contact_esc', label: t('support.menu.contact'), icon: LifeBuoy },
  ];

  return (
    <>
      <AnimatePresence>
        {isTawkLoaded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, backgroundColor: '#ffffff' }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleBot}
            className={cn(
              "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[110] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-2xl transition-all border-2 border-black/5 cursor-pointer overflow-hidden",
              isOpen ? "bg-red-500 text-white border-red-400 rotate-90" : "bg-amber-500 text-black border-amber-400"
            )}
          >
            {isOpen ? <X size={24} /> : <MessageCircle size={24} strokeWidth={2.5} />}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[110] w-[calc(100vw-48px)] sm:w-[400px] h-[550px] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-white font-display font-black uppercase text-xs tracking-[0.2em]">{t('support.bot_name')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              {chatState !== 'menu' && (
                <button 
                  onClick={() => setChatState('menu')}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Bot Welcome */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                  <Bot size={14} />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5">
                  {t('support.welcome')}
                </div>
              </div>

              {/* Main Menu State */}
              {chatState === 'menu' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 gap-2"
                >
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setChatState(item.id as ChatState)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon size={18} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Response State */}
              {(chatState === 'security' || chatState === 'prims' || chatState === 'rentals' || chatState === 'rules') && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-amber-500 text-black rounded-2xl rounded-tr-none p-4 text-xs font-black uppercase tracking-widest shadow-lg">
                      {menuItems.find(i => i.id === chatState)?.label}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t(`support.responses.${chatState}`)}
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatState('menu')}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    {t('common.back_home')}
                  </button>
                </motion.div>
              )}

              {/* Invite Prompt State */}
              {chatState === 'invite_prompt' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t('support.responses.invite_prompt')}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={uuid}
                      onChange={(e) => setUuid(e.target.value)}
                      placeholder="Avatar UUID..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                    <button 
                      onClick={handleInvite}
                      disabled={isSendingInvite || uuid.length < 32}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        isSendingInvite || uuid.length < 32 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {isSendingInvite ? t('support.responses.sending') : <><Send size={14} /> Enviar Convite</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Invite Result */}
              {chatState === 'invite_sent' && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                 >
                   <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className={cn(
                      "bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed border font-medium",
                      inviteResult?.success ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20"
                    )}>
                      {inviteResult?.message}
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatState('menu')}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    {t('common.back_home')}
                  </button>
                 </motion.div>
              )}

              {/* Escalation State */}
              {chatState === 'contact_esc' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
                      {t('support.responses.contact_esc')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={openTawk}
                      className="w-full py-5 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/20"
                    >
                      {t('support.responses.contact_yes')}
                    </button>
                    <button 
                      onClick={() => setChatState('menu')}
                      className="w-full py-5 rounded-2xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      {t('support.responses.contact_no')}
                    </button>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer decoration */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/40">
               <div className="flex items-center justify-center gap-2">
                 <Bot size={12} className="text-white/20" />
                 <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Holanbra AI Support System</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
