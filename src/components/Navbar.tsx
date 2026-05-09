import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, User as Admin, Layers, MessageSquare, Paintbrush, FileText, ShieldCheck, Users, ImageIcon, LayoutDashboard, DollarSign, Briefcase, Globe } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'pt', label: 'PT' },
    { code: 'es', label: 'ES' },
    { code: 'nl', label: 'NL' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };
  
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
          setIsAdmin(!!sbUser.app_metadata?.is_admin);
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
    { name: 'About', path: '/#about', icon: Users, label: t('nav.about') },
    { name: 'Properties', path: '/#properties', icon: Layers, highlight: true, label: t('nav.properties') },
    { name: 'Gallery', path: '/#gallery', icon: ImageIcon, label: t('nav.gallery') },
    { name: 'Decoration', path: '/#services', icon: Paintbrush, label: t('nav.decoration') },
    { name: 'Team', path: '/#team', icon: Users, label: t('nav.team') },
    { name: 'Covenant', path: '/covenant', icon: FileText, label: t('nav.covenant') },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname + (location.hash || '');
    // Handle both cases: path with leading slash and without
    if (path.startsWith('/#') && location.pathname === '/') {
      return location.hash === path.substring(1);
    }
    return currentPath === path || (location.pathname === path && !location.hash);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent",
      mobileMenuOpen ? "z-[9999]" : "z-50"
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
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 pr-6 border-r border-white/10">
            {navLinks.map((link: any) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={cn(
                  "relative group text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-amber-400 whitespace-nowrap py-1",
                  isActive(link.path) ? "text-white" : "text-white/60",
                  link.highlight && "text-amber-500"
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500"
                    initial={false}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 mr-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black transition-all",
                    i18n.language.startsWith(lang.code) ? "bg-amber-500 text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            {isAdmin && (
              <Link 
                to="/admin" 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
              >
                <LayoutDashboard size={14} className="text-amber-500" />
                ADMIN
              </Link>
            )}

            <Link 
              to="/resident" 
              className="px-6 py-2 bg-amber-500 text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ShieldCheck size={14} />
              {t('nav.resident_portal')}
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              mobileMenuOpen ? "bg-amber-500 text-black scale-90" : "bg-white/5 text-gray-400"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9000] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-zinc-950 border-l border-white/10 shadow-2xl md:hidden flex flex-col z-[9999] overflow-hidden"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center -rotate-6 shadow-lg shadow-amber-500/20">
                      <span className="text-black font-black text-xl">H</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tighter text-white uppercase leading-none">HOLANBRA</span>
                      <span className="text-[7px] font-mono tracking-[0.2em] text-white/30 uppercase">Virtual Estates</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 scrollbar-hide">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 ml-1">{t('nav.navigation', 'Navigation')}</p>
                    
                    {/* Explicit Home Link for Mobile */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link 
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "group py-4 px-1 flex items-center justify-between transition-all border-b border-white/5",
                          isActive('/') ? "text-amber-500" : "text-white hover:text-amber-400"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isActive('/') ? "bg-amber-500/20 text-amber-500 shadow-inner" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                          )}>
                            <Home size={18} />
                          </div>
                          <span className="text-lg font-bold tracking-tight">{t('nav.home', 'Home')}</span>
                        </div>
                        {isActive('/') && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                      </Link>
                    </motion.div>

                    {navLinks.map((link: any, idx: number) => {
                      const Icon = link.icon;
                      return (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + idx * 0.05 }}
                        >
                          <Link 
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "group py-4 px-1 flex items-center justify-between transition-all border-b border-white/5",
                              isActive(link.path) ? "text-amber-500" : "text-white hover:text-amber-400"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                isActive(link.path) ? "bg-amber-500/20 text-amber-500 shadow-inner" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                              )}>
                                <Icon size={18} />
                              </div>
                              <span className="text-lg font-bold tracking-tight">{link.label}</span>
                            </div>
                            {isActive(link.path) && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                  {/* Mobile Language Selector */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                      <Globe size={10} /> {t('nav.language', 'Language')}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "py-3 rounded-xl text-[10px] font-black transition-all border",
                            i18n.language.startsWith(lang.code) 
                              ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10" 
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-4 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-white/10 transition-all hover:bg-white/10"
                      >
                        <LayoutDashboard size={16} className="text-amber-500" />
                        {t('admin.navigation', 'Admin Area')}
                      </Link>
                    )}
                    <Link 
                      to="/resident" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-5 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
                    >
                      <ShieldCheck size={18} />
                      {t('nav.resident_portal')}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
