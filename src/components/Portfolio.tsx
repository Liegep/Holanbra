import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Pricing from './Pricing';
import Gallery from './Gallery';

// Definition of portfolio item
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export default function Portfolio() {
  const { lang: paramLang } = useParams();
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Use i18n language as the primary source for translation lookup
  const currentLang = i18n.language || paramLang || 'en';

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Could not fetch portfolio items:', error);
          setItems([]);
        } else {
          // Normalize the data to use standard title/description keys
          const normalizedData = (data || []).map((item: any) => {
            const titleField = currentLang && currentLang !== 'en' ? `title_${currentLang}` : 'title';
            const descField = currentLang && currentLang !== 'en' ? `description_${currentLang}` : 'description';
            
            return {
              id: item.id,
              title: item[titleField] || item.title || '',
              description: item[descField] || item.description || '',
              image_url: item.image_url
            };
          });
          setItems(normalizedData);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [currentLang]);

  const baseUrl = ''; // Removed dynamic lang prefix since we use standard routes

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-background-dark">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="text-left space-y-4">
            <Link 
              to={`${baseUrl}/`} 
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              {t('common.back_home')}
            </Link>
            <h1 className="text-5xl font-display font-black text-white">{t('portfolio.title')}</h1>
            <p className="text-white/50 text-sm max-w-xl">{t('portfolio.subtitle')}</p>
          </div>
          <button 
            onClick={() => {
              const element = document.getElementById('pricing');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-8 py-4 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all w-full md:w-auto text-center"
          >
            {t('portfolio.start')}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/50 space-y-4">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <p className="uppercase tracking-widest text-[10px] font-bold">{t('portfolio.loading')}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-white/50 uppercase tracking-widest text-xs font-bold">{t('portfolio.none')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-white/5 border border-white/10"
              >
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{item.title}</h3>
                  <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-24">
        <Gallery />
      </div>
      
      <div className="mt-16">
        <Pricing />
      </div>
    </div>
  );
}
