import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, User as Admin, Layers, MessageSquare, Paintbrush, FileText, ShieldCheck, Users, Image as ImageIcon, LayoutDashboard, Globe, DollarSign, Briefcase } from 'lucide-react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { SUPPORTED_LANGS } from '../i18n';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract lang from pathname since Navbar is outside the parameterized Routes
  const pathParts = location.pathname.split('/');
  const lang = SUPPORTED_LANGS.includes(pathParts[1]) ? pathParts[1] : (i18n.language?.split('-')[0] || 'en');

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

  const changeLanguage = (newLang: string) => {
    // If we are on admin or resident portal, don't change the URL prefix in the address bar
    // but do update the i18n state
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/resident')) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
      return;
    }

    // Replace the language part of the current path
    const pathParts = location.pathname.split('/');
    
    // pathParts[0] is always empty string for paths starting with /
    if (SUPPORTED_LANGS.includes(pathParts[1])) {
      pathParts[1] = newLang;
    } else {
      // If there's no supported lang prefix at the start, prepend it
      pathParts.splice(1, 0, newLang);
    }
    
    // Reconstruct path, ensuring we don't have double slashes from empty parts if unnecessary
    // but preserving the structure. .join('/') usually handles this fine.
    let newPathname = pathParts.join('/');
    if (newPathname === '') newPathname = '/';

    const newPath = newPathname + location.search + location.hash;
    
    // Update i18n before navigation to ensure UI reacts immediately
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    
    navigate(newPath);
  };

  const navLinks = [
    { name: 'About', path: `/${lang}/#about`, icon: Users, label: t('nav.about') },
    { name: 'Properties', path: `/${lang}/#properties`, icon: Layers, highlight: true, label: t('nav.properties') },
    { name: 'Gallery', path: `/${lang}/#gallery`, icon: ImageIcon, label: t('nav.gallery') },
    { name: 'Decoration', path: `/${lang}/#services`, icon: Paintbrush, label: t('nav.decoration') },
    { name: 'Team', path: `/${lang}/#team`, icon: Users, label: t('nav.team') },
    { name: 'Covenant', path: `/${lang}/covenant`, icon: FileText, label: t('nav.covenant') },
  ];

  const languages = [
    { code: 'en', flag: '🇺🇸' },
    { code: 'pt', flag: '🇧🇷' },
    { code: 'es', flag: '🇪🇸' },
    { code: 'nl', flag: '🇳🇱' }
  ];

  const getLocalizedLink = (path: string) => {
     if (path.startsWith('/admin') || path.startsWith('/resident')) return path;
     return `/${lang}${path === '/' ? '' : path}`;
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-background-dark/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={`/${lang}`} className="flex items-center gap-3 group">
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
                  "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-amber-400 whitespace-nowrap",
                  location.pathname + location.hash === link.path ? "text-white" : "text-white/60",
                  link.highlight && "text-amber-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage(l.code);
                  }}
                  className={cn(
                    "text-lg transition-all hover:scale-125 cursor-pointer",
                    lang === l.code ? "grayscale-0 opacity-100" : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  {l.flag}
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
          <div className="flex items-center gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={cn(
                  "text-base",
                  lang === l.code ? "border-b-2 border-amber-500 pb-0.5" : "grayscale opacity-50"
                )}
              >
                {l.flag}
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
                  className="text-lg font-medium text-gray-400 hover:text-white flex items-center gap-3"
                >
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
