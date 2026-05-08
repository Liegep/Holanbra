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
        <div className="flex items-center gap-4 md:hidden">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 mr-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  "px-2 py-1 rounded-full text-[8px] font-black transition-all",
                  i18n.language.startsWith(lang.code) ? "bg-amber-500 text-black" : "text-white/40 hover:text-white"
                )}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            className="p-2 text-gray-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
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
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium flex items-center gap-3 transition-colors",
                    isActive(link.path) ? "text-amber-500" : "text-gray-400 hover:text-white"
                  )}
                >
                  <link.icon size={20} className={cn(isActive(link.path) ? "text-amber-500" : "text-gray-500")} />
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-3 border border-white/10"
                >
                  <LayoutDashboard size={20} className="text-amber-500" />
                  {t('admin.navigation')}
                </Link>
              )}
              <Link 
                to="/resident" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 rounded-2xl bg-amber-500 text-black font-bold flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
              >
                <ShieldCheck size={20} />
                {t('nav.resident_portal')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
