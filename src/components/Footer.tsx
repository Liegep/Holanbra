import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="py-24 px-6 md:px-12 border-t border-white/5 bg-background-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h3 className="text-2xl font-display font-bold tracking-tighter uppercase">HOLANBRA<span className="text-amber-500"> SL</span></h3>
          <p className="text-amber-100/40 text-xs leading-relaxed uppercase tracking-widest">
            {t('sections.footer_desc')}
          </p>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('common.navigation')}</h4>
          <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <li><Link to="/" className="hover:text-amber-400 transition-colors">{t('common.home')}</Link></li>
            <li><Link to="/#imoveis" className="hover:text-amber-400 transition-colors">{t('common.properties')}</Link></li>
            <li><Link to="/covenant" className="hover:text-amber-400 transition-colors">{t('common.covenant')}</Link></li>
            <li><Link to="/resident" className="hover:text-amber-400 transition-colors">{t('auth.resident_portal')}</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('common.contact')}</h4>
          <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <li className="flex items-center gap-3"><MessageSquare size={12} className="text-amber-500" /> {t('tickets.staff_response')}</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60">{t('common.follow_us')}</h4>
          <div className="flex gap-4">
            <a href="#" className="p-3 rounded-full border border-white/5 hover:bg-amber-500/20 transition-all">
              <Instagram size={16} />
            </a>
            <a href="#" className="p-3 rounded-full border border-white/5 hover:bg-amber-500/20 transition-all">
              <Facebook size={16} />
            </a>
            <a href="#" className="p-3 rounded-full border border-white/5 hover:bg-amber-500/20 transition-all">
              <MapPin size={16} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-amber-500/30 uppercase tracking-[0.2em]">
        <p>&copy; 2026 Holanbra Real Estate SL. {t('common.rights')}</p>
        <div className="flex items-center gap-8">
          <p>COORD: 128.00 / 45.22 / 2001</p>
          <Link to="/admin" className="opacity-20 hover:opacity-100 transition-opacity">{t('admin.admin')}</Link>
        </div>
      </div>
    </footer>
  );
}
