import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, MapPin, Facebook, Mail, X, Loader2, Send } from 'lucide-react';
import { GridStatus } from './GridStatus';
import { supabase } from '../lib/supabase';
import Toast, { ToastType } from './Toast';

export default function Footer() {
  const { t } = useTranslation();
  const [links, setLinks] = useState({
    facebook: '#',
    location: 'secondlife:///app/teleport/Holanbra/210/90/25'
  });

  useEffect(() => {
    supabase.from('site_settings').select('facebook_url, location_url').eq('id', 'site_links').maybeSingle().then(({ data }) => {
      if (data) {
        setLinks({
          facebook: data.facebook_url || '#',
          location: data.location_url || 'secondlife:///app/teleport/Holanbra/210/90/25'
        });
      }
    });
  }, []);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageForm, setMessageForm] = useState({
    visitor_name: '',
    message: ''
  });
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const openLiveChat = () => {
    // @ts-ignore
    if (window.Tawk_API) {
      // @ts-ignore
      window.Tawk_API.maximize();
    } else {
      alert("Chat is loading or not available. Please contact us in-world!");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.visitor_name || !messageForm.message) {
      showToast(t('footer.fill_fields'), 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure NO .select() is used to avoid RLS failures when SELECT is denied
      const { error } = await supabase.from('contact_messages').insert([{
        visitor_name: messageForm.visitor_name,
        recipient_name: 'Admin', // Default recipient
        message: messageForm.message,
        is_read: false
      }]);

      if (error) throw error;
      
      showToast(t('footer.msg_sent_long', 'Message sent successfully. Our team will respond as soon as possible.'));
      setMessageForm({ visitor_name: '', message: '' });
      setIsMessageModalOpen(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      showToast(t('footer.msg_error', 'Could not send your message. Please try again.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <footer className="py-24 px-6 md:px-12 border-t border-white/5 bg-background-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold tracking-tighter uppercase">HOLANBRA<span className="text-amber-500"> SL</span></h3>
            <p className="text-amber-100/40 text-xs leading-relaxed uppercase tracking-widest">
              {t('footer.desc')}
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('footer.nav')}</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <li><Link to="/#properties" className="hover:text-amber-400 transition-colors">{t('nav.properties')}</Link></li>
              <li><Link to="/covenant" className="hover:text-amber-400 transition-colors">{t('nav.covenant')}</Link></li>
              <li><Link to="/resident" className="hover:text-amber-400 transition-colors">Resident Portal</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Admin</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('footer.contact')}</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <li>
                <button onClick={openLiveChat} className="flex items-center gap-3 hover:text-amber-400 transition-colors text-left">
                  <MessageSquare size={12} className="text-amber-500 shrink-0" /> {t('footer.live_chat')}
                </button>
              </li>
              <li>
                <button onClick={() => setIsMessageModalOpen(true)} className="flex items-center gap-3 hover:text-amber-400 transition-colors text-left">
                  <Mail size={12} className="text-amber-500 shrink-0" /> {t('footer.send_msg_btn')}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('footer.follow')}</h4>
            <div className="flex gap-4">
              <a href={links.facebook} className="p-3 rounded-full border border-white/5 hover:bg-amber-500/20 transition-all">
                <Facebook size={16} />
              </a>
              <a href={links.location} className="p-3 rounded-full border border-white/5 hover:bg-amber-500/20 transition-all">
                <MapPin size={16} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-amber-500/30 uppercase tracking-[0.2em]">
          <p>&copy; 2026 Holanbra Real Estate SL. {t('footer.all_rights')}</p>
          <div className="flex items-center gap-8">
            <p>COORD: 128.00 / 45.22 / 2001</p>
            <GridStatus />
            <Link to="/admin" className="opacity-20 hover:opacity-100 transition-opacity">Admin</Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isMessageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
              
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-display font-bold uppercase italic tracking-widest mb-2">{t('footer.msg_modal_title')}</h3>
              <p className="text-[10px] tracking-widest uppercase font-bold text-white/40 mb-8">
                {t('footer.msg_modal_desc')}
              </p>

              <form onSubmit={handleSendMessage} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-amber-500">{t('footer.your_name_label')}</label>
                  <input 
                    type="text" 
                    required
                    value={messageForm.visitor_name}
                    onChange={(e) => setMessageForm({ ...messageForm, visitor_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="e.g. Avatar Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-amber-500">{t('footer.msg_label')}</label>
                  <textarea 
                    required
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    placeholder={t('footer.msg_placeholder')}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t('footer.sending', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <Send size={16} /> 
                        {t('footer.send_msg_btn')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </>
  );
}
