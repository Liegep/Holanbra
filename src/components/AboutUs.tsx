import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation, Trans } from 'react-i18next';
import { supabase } from '../lib/supabase';

export default function AboutUs() {
  const { t } = useTranslation();
  const [aboutImage, setAboutImage] = useState('https://images.unsplash.com/photo-1600585154340-be6199f3e009?w=1200&q=80');

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'hero_section')
          .maybeSingle();
        
        if (data && data.about_image_url) {
          setAboutImage(data.about_image_url);
        }
      } catch (err) {
        console.error("Error fetching about image:", err);
      }
    };
    fetchHero();
  }, []);

  return (
    <section id="about" className="py-32 bg-black overflow-hidden scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">{t('about.history')}</span>
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tighter text-left">
                {t('about.title1')} <span className="italic font-light text-amber-400">{t('about.title2')}</span>
              </h2>
            </div>
            
            <div className="space-y-6 text-amber-100/60 leading-relaxed font-light text-lg text-left">
              <p>
                <Trans 
                  i18nKey="about.p1"
                  components={{
                    ymir: <span className="text-white font-medium" />,
                    marie: <span className="text-white font-medium" />
                  }}
                />
              </p>
              
              <p>
                {t('about.p2')}
              </p>
              
              <p className="border-l-2 border-amber-500/30 pl-8 py-2 italic font-normal">
                {t('about.quote')}
              </p>
              
              <p>
                {t('about.p4')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group">
              <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-transparent transition-colors duration-700 z-10" />
              <img 
                src={aboutImage} 
                alt="Holanbra Creators" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-2 border-white/5 rounded-[2rem] z-20 pointer-events-none" />
            </div>
            
            {/* Decortive elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full -z-10" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
