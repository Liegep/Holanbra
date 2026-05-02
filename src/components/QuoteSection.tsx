import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function QuoteSection() {
  const { t } = useTranslation();

  return (
    <section className="py-60 bg-black text-center px-6 overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto relative z-10"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500/30 mb-12 block">{t('philosophy')}</span>
        <h2 className="text-4xl md:text-7xl font-display font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto">
          "{t('quote_title')} <br className="hidden md:block" /> 
          <span className="italic text-amber-400 font-light">{t('quote_italic')}</span> <br className="hidden md:block" />
          {t('quote_end')}"
        </h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 text-white/20 text-xs font-bold uppercase tracking-[0.4em]"
        >
          {t('quote_subtitle')}
        </motion.p>
      </motion.div>
      
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[40vh] bg-amber-500/[0.03] blur-[150px] pointer-events-none rounded-full"></div>
    </section>
  );
}
