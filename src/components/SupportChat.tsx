import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send, Shield, Layout, UserPlus, Home, Scroll, LifeBuoy, ChevronLeft, Bot, ExternalLink, MapPin, Eye, Loader2, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type ChatState = 'idle' | 'menu' | 'security' | 'prims' | 'rentals' | 'rules' | 'faq' | 'available_rentals' | 'contact_esc' | 'invite_confirm' | 'invite_prompt' | 'invite_sent';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SupportChat() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [uuid, setUuid] = useState('');
  const [residentData, setResidentData] = useState<any>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableRentals, setAvailableRentals] = useState<any[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalsPage, setRentalsPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const fetchAvailableRentals = async () => {
    setRentalsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableRentals(data || []);
    } catch (e) {
      console.error('[SupportChat] Error fetching rentals:', e);
    } finally {
      setRentalsLoading(false);
    }
  };

  useEffect(() => {
    if (chatState === 'available_rentals') {
      fetchAvailableRentals();
    }
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState]);

  useEffect(() => {
    // Check for existing resident session
    const fetchResident = async () => {
      const savedName = localStorage.getItem('sl_resident_name');
      const savedPass = localStorage.getItem('sl_resident_pass');
      
      if (savedName && savedPass) {
        try {
          const { data } = await supabase
            .from('renters')
            .select('avatar_uuid, avatar_name')
            .eq('avatar_name', savedName.trim())
            .eq('password', savedPass.trim())
            .maybeSingle();
          
          if (data) {
            setResidentData(data);
          }
        } catch (e) {
          console.warn('[SupportChat] Session fetch failed', e);
        }
      }
    };
    fetchResident();

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

  const handleInvite = async (forcedUuid?: string) => {
    const targetUuid = (forcedUuid || uuid).trim();
    
    // Requirement 1: Check for resident login
    if (!residentData?.avatar_uuid) {
      setInviteResult({ 
        success: false, 
        message: t('support.responses.invite_login_required') 
      });
      setChatState('invite_sent');
      return;
    }

    if (!targetUuid || !UUID_REGEX.test(targetUuid)) {
      setInviteResult({ 
        success: false, 
        message: t('support.responses.invite_invalid') 
      });
      setChatState('invite_sent');
      return;
    }
    
    setIsSendingInvite(true);
    const endpoint = '/api/smartbots/group-invite';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          avatar_uuid: targetUuid,
          resident_uuid: residentData.avatar_uuid,
          language: i18n.language?.slice(0, 2) || 'en'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('[SmartBots Invite Error RAW]', JSON.stringify(data, null, 2));
      }

      let finalMessage = data.success ? t('support.responses.invite_success') : t('support.responses.invite_error');
      
      if (!data.success) {
        const errorText = (data.error || '').toLowerCase();
        if (errorText.includes('resident login required')) {
          finalMessage = t('support.responses.invite_login_required');
        } else if (errorText.includes('wrong resident uuid')) {
          finalMessage = "This avatar UUID was not accepted by SmartBots. Please check the Second Life avatar UUID.";
        } else if (errorText.includes('bot not found')) {
          finalMessage = "The SmartBots bot name or access settings are incorrect.";
        } else if (errorText.includes('wrong access code')) {
          finalMessage = "The SmartBots access code is incorrect.";
        } else if (errorText.includes('group not found')) {
          finalMessage = "The group UUID is incorrect.";
        } else if (data.error) {
          finalMessage = `SmartBots could not send the invite: ${data.error}`;
        }
      }

      setInviteResult({ 
        success: data.success, 
        message: finalMessage
      });
      setChatState('invite_sent');
    } catch (error) {
      console.error(`[SupportChat] Network or Runtime Error Calling ${endpoint}:`, error);
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
    { id: 'available_rentals', label: t('support.menu.available_rentals'), icon: Home },
    { id: 'rules', label: t('support.menu.rules'), icon: Scroll },
    { id: 'faq', label: t('support.menu.faq'), icon: LifeBuoy },
    { id: 'contact_esc', label: t('support.menu.contact'), icon: LifeBuoy },
  ];

  const renderExpandedContent = (state: ChatState) => {
    const response = t(`support.responses.${state}`, { returnObjects: true }) as any;
    
    if (typeof response === 'string') {
      return response.split('[split]').map((msg, i) => (
        <div key={i} className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium mb-3 last:mb-0">
          {msg.trim()}
        </div>
      ));
    }

    if (typeof response === 'object' && response !== null) {
      const parts = [];
      const order = ['content', 'steps', 'details', 'intro', 'summary', 'description'];
      
      for (const key of order) {
        if (response[key]) {
          parts.push(
            <div key={key} className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium mb-3 last:mb-0">
              {response[key]}
            </div>
          );
        }
      }

      if (parts.length > 0) return parts;
    }

    return (
      <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-white/80 text-sm leading-relaxed border border-white/5 font-medium">
        {t(`support.responses.${state}`)}
      </div>
    );
  };

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
            className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 z-[110] w-full sm:w-[400px] h-full sm:h-[550px] bg-zinc-950 sm:border sm:border-white/10 sm:rounded-[2.5rem] sm:shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-white/5 flex items-center justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black overflow-hidden border-2 border-amber-400">
                  <img src="/bot-avatar.png" alt="Bot Avatar" className="w-full h-full object-cover" />
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
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (item.id === 'invite_prompt') {
                          if (!residentData?.avatar_uuid) {
                            setInviteResult({ 
                              success: false, 
                              message: t('support.responses.invite_login_required') 
                            });
                            setChatState('invite_sent');
                            return;
                          }

                          // Try both residentData state and localStorage as fallback
                          const savedUuid = residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid');
                          if (savedUuid && UUID_REGEX.test(savedUuid)) {
                            setUuid(savedUuid); // Set the current uuid state for displaying in confirmation
                            setChatState('invite_confirm');
                          } else {
                            setChatState('invite_prompt');
                          }
                        } else {
                          setChatState(item.id as ChatState);
                        }
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-amber-500 transition-all text-left group cursor-pointer relative z-10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon size={18} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Response State */}
              {(chatState === 'security' || chatState === 'prims' || chatState === 'rentals' || chatState === 'rules' || chatState === 'faq') && (
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
                  <div className="flex items-start gap-3 flex-col">
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                        <Bot size={14} />
                      </div>
                      <div className="flex-1">
                        {renderExpandedContent(chatState)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatState('menu')}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display"
                  >
                    {t('common.back_home')}
                  </button>
                </motion.div>
              )}

              {/* Available Rentals State */}
              {chatState === 'available_rentals' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-amber-500 text-black rounded-2xl rounded-tr-none p-4 text-xs font-black uppercase tracking-widest shadow-lg">
                      {t('support.menu.available_rentals')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {rentalsLoading ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 size={24} className="text-amber-500 animate-spin" />
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Searching properties...</span>
                      </div>
                    ) : availableRentals.length === 0 ? (
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto">
                          <Home size={20} />
                        </div>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                          {t('support.responses.no_available_rentals')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {availableRentals.slice(0, rentalsPage * 5).map((property) => (
                            <div key={property.id} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                              {property.image_url && (
                                <div className="h-32 w-full relative">
                                  <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
                                  <div className="absolute top-3 left-3 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                    {t('properties.status_available')}
                                  </div>
                                </div>
                              )}
                              <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-white font-bold text-sm">{property.name}</h4>
                                  <div className="text-amber-500 text-xs font-bold">L$ {property.rental_price || property.price}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                                    <Layers size={12} />
                                    <span>{property.prims_allowed} {t('properties.prims_allowed')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                                    <Layout size={12} />
                                    <span>{property.size || '3410m²'}</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-white/60 line-clamp-2">
                                  <span dangerouslySetInnerHTML={{ __html: (property[`description_${i18n.language.slice(0, 2)}`] || property.description || "Luxury property in Holanbra.") }} />
                                </p>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                  <button 
                                    onClick={() => {
                                      window.location.href = '#properties';
                                      setIsOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-white/60 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                  >
                                    <Eye size={12} />
                                    {t('hero.tour')}
                                  </button>
                                  <button 
                                    onClick={() => window.open(property.teleport_url || property.slurl, '_blank')}
                                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                                  >
                                    <MapPin size={12} />
                                    {t('properties.teleport')}
                                  </button>
                                  {property.virtual_tour_url && (
                                    <button 
                                      onClick={() => window.open(property.virtual_tour_url, '_blank')}
                                      className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-white/60 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                                    >
                                      <ExternalLink size={12} />
                                      {t('hero.tour')}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {availableRentals.length > rentalsPage * 5 && (
                          <button 
                             onClick={() => setRentalsPage(prev => prev + 1)}
                             className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display flex items-center justify-center gap-2"
                          >
                             {t('properties.view_all')} <ChevronRight size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setChatState('menu');
                      setRentalsPage(1);
                    }}
                    className="w-full py-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display"
                  >
                    {t('common.back_home')}
                  </button>
                </motion.div>
              )}

              {/* Invite Prompt State */}
              {chatState === 'invite_confirm' && (
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
                      {t('support.responses.invite_confirm', { uuid: uuid })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => handleInvite(uuid)}
                      disabled={isSendingInvite}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        isSendingInvite 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {isSendingInvite ? t('support.responses.sending') : <><Send size={14} /> {t('support.responses.invite_yes')}</>}
                    </button>
                    <button 
                      onClick={() => {
                        setUuid('');
                        setChatState('invite_prompt');
                      }}
                      className="w-full py-4 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      {t('support.responses.invite_no')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Invite Entry State */}
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
                      onClick={() => handleInvite()}
                      disabled={isSendingInvite}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                        isSendingInvite 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {isSendingInvite ? t('support.responses.sending') : <><Send size={14} /> {t('support.responses.send_invite')}</>}
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
