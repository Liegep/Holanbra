import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, User as Admin, Layers, MessageSquare, Paintbrush, FileText, ShieldCheck, Users, Image as ImageIcon, LayoutDashboard, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
    { code: 'nl', label: 'Nederlands' }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const checkAdmin = async (sbUser: any) => {
      setUser(sbUser);
      if (sbUser) {
        const whitelist = ['hello@liegepaschoalini.design', 'slmariew@gmail.com', 'victoriaholanbra@gmail.com'];
        const isWhitelisted = sbUser.email && whitelist.includes(sbUser.email.toLowerCase());
        
        if (isWhitelisted) {
          setIsAdmin(true);
        } else {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('is_admin')
              .eq('email', sbUser.email)
              .single();
            
            setIsAdmin(!!(data && data.is_admin));
          } catch (e) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home, external: false },
    { name: 'About', path: '/#about', icon: Users, external: false },
    { name: 'Properties', path: '/#imoveis', icon: Layers, highlight: true, external: false },
    { name: 'Gallery', path: '/#gallery', icon: ImageIcon, external: false },
    { name: 'Services', path: '/#servicos', icon: Paintbrush, external: false },
    { name: 'Team', path: '/#team', icon: Users, external: false },
    { name: 'Covenant', path: '/covenant', icon: FileText, external: false },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-background-dark/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(247,203,69,0.3)]">
            <span className="text-black font-black text-xl">H</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-bold tracking-tighter uppercase whitespace-nowrap leading-none">HOLANBRA <span className="font-light text-amber-500">SL</span></span>
            <span className="text-[8px] font-mono tracking-[0.3em] text-white/40 uppercase">Virtual Estates</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link: any) => (
            link.external ? (
              <a 
                key={link.name} 
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-amber-400 text-white/60"
              >
                {t(link.name.toLowerCase())}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.path}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-amber-400",
                  location.pathname + location.hash === link.path ? "text-white" : "text-white/60",
                  link.highlight && "text-amber-500"
                )}
              >
                {t(link.name.toLowerCase())}
              </Link>
            )
          ))}

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 text-white/60 hover:text-white transition-all flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"
            >
              <Globe size={14} />
              {i18n.language.split('-')[0]}
            </button>
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[120px]"
                >
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full text-left px-4 py-3 text-[10px] uppercase font-black tracking-widest transition-all hover:bg-white/5",
                        i18n.language.startsWith(lang.code) ? "text-amber-500" : "text-white/60"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <Link 
              to="/admin" 
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
            >
              <LayoutDashboard size={14} className="text-amber-500" />
              {t('admin')}
            </Link>
          )}
          <Link 
            to="/resident" 
            className="px-6 py-2 bg-amber-500 text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <ShieldCheck size={14} />
            {t('resident_area')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-gray-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                link.external ? (
                  <a 
                    key={link.name} 
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-400 hover:text-white flex items-center gap-3"
                  >
                    <link.icon size={20} />
                    {t(link.name.toLowerCase())}
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-400 hover:text-white flex items-center gap-3"
                  >
                    <link.icon size={20} />
                    {t(link.name.toLowerCase())}
                  </Link>
                )
              ))}

              <div className="flex gap-4 py-4 border-y border-white/5">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={cn(
                      "text-[10px] uppercase font-black p-2 rounded-lg border",
                      i18n.language.startsWith(lang.code) ? "bg-amber-500 border-amber-500 text-black" : "border-white/10 text-white/40"
                    )}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-3 border border-white/10"
                >
                  <LayoutDashboard size={20} className="text-amber-500" />
                  {t('admin_panel')}
                </Link>
              )}
              <Link 
                to="/resident" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 rounded-2xl bg-amber-500 text-black font-bold flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
              >
                <ShieldCheck size={20} />
                {t('resident_area')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
