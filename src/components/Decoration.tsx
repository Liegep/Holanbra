import React from 'react';
import { motion } from 'motion/react';
import { Paintbrush, Sparkles, Layout, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function Decoration() {
  const { t } = useTranslation();

  return (
    <section id="servicos" className="py-32 px-6 md:px-12 bg-background-light relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Branding & Header */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Paintbrush size={14} />
              {t('decoration_services')}
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-none text-black"
            >
              {t('level_up_title')} <br /> 
              <span className="text-amber-600 italic">{t('virtual_abode')}</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-black/50 leading-relaxed max-w-md font-light"
            >
              {t('decoration_desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bento-card bg-amber-500 text-black group overflow-hidden relative shadow-2xl"
            >
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{t('creative_realm')}</p>
                <p className="text-xl font-bold leading-tight">
                  {t('creative_realm_desc')}
                </p>
                <button className="px-6 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                  {t('request_project')}
                </button>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 -rotate-12 group-hover:scale-110 transition-transform" />
            </motion.div>
          </div>

          {/* Right Side: Feature Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 01 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bento-card p-10 bg-white shadow-xl border-black/5 flex flex-col justify-between h-[350px]"
            >
              <span className="text-6xl font-display font-black text-black/5">01</span>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-black mb-4">{t('find_style')}</h3>
                <p className="text-black/40 text-sm leading-relaxed uppercase tracking-widest font-medium">
                  {t('find_style_desc')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-amber-500/20 flex items-center justify-center">
                <Layout className="text-amber-600" size={20} />
              </div>
            </motion.div>

            {/* Feature 02 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bento-card p-10 bg-amber-500 text-black shadow-xl border-amber-500/10 flex flex-col justify-between h-[350px]"
            >
              <span className="text-6xl font-display font-black text-black/10">02</span>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-black mb-4">{t('selected_furnishings')}</h3>
                <p className="text-black/60 text-sm leading-relaxed uppercase tracking-widest font-medium">
                  {t('selected_furnishings_desc')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                <Sparkles className="text-black" size={20} />
              </div>
            </motion.div>

            {/* Feature 03 - Your Dreams */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bento-card bg-black text-white shadow-xl border-white/5 flex flex-col h-[350px] relative overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale hover:opacity-40 transition-opacity"
                alt="Your Dreams"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 p-10 flex flex-col justify-between h-full">
                <span className="text-6xl font-display font-black text-white/5">03</span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-amber-500 mb-4 uppercase tracking-tighter">{t('your_dreams')}</h3>
                  <p className="text-white/40 text-sm leading-relaxed uppercase tracking-widest font-medium">
                    {t('your_dreams_desc')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 04 - Have it your way */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bento-card p-10 bg-white shadow-xl border-black/5 flex flex-col justify-between h-[350px]"
            >
              <span className="text-6xl font-display font-black text-black/5">04</span>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-black mb-4">{t('have_it_way')}</h3>
                <p className="text-black/40 text-sm leading-relaxed uppercase tracking-widest font-medium">
                  {t('have_it_way_desc')}
                </p>
              </div>
              <div className="relative w-full h-24 rounded-2xl overflow-hidden grayscale brightness-125">
                 <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </motion.div>

            {/* Custom Banner Card (Span 2) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="md:col-span-2 bento-card p-8 bg-black text-white border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Paintbrush className="text-amber-400" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white">{t('transform_island')}</h4>
                  <p className="text-white/40 text-xs uppercase tracking-widest">{t('free_consultation')}</p>
                </div>
              </div>
              <button className="p-4 bg-white text-black rounded-full hover:bg-amber-400 transition-colors">
                <ArrowUpRight />
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
