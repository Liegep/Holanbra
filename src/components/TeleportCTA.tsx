import { motion } from 'motion/react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TeleportCTA() {
  const { t } = useTranslation();
  const teleportUrl = "secondlife:///app/teleport/Holanbra/128/128/22";

  return (
    <section className="py-32 bg-background-dark relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
            {t('teleport_cta.title')} <br />
            <span className="text-amber-400 italic font-light">{t('teleport_cta.span')}</span>
          </h2>
          
          <div className="flex flex-col items-center gap-6">
            <a 
              href={teleportUrl}
              className="group relative px-12 py-6 bg-amber-500 text-black rounded-full font-bold text-lg uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-amber-500/20"
            >
              <MapPin className="group-hover:animate-bounce" size={24} />
              {t('teleport_cta.btn')}
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
            </a>
            
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
              {t('teleport_cta.req')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Atmospheric Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.02] blur-[120px] rounded-full" />
      </div>
    </section>
  );
}
