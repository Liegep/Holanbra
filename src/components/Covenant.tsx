import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, Loader2, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const Covenant: React.FC = () => {
  const { lang: urlLang } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }
  ];

  useEffect(() => {
    const fetchCovenant = async () => {
      try {
        const { data: covenantData } = await supabase
          .from('land_covenants')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (covenantData) {
          setData(covenantData);
        }
      } catch (error) {
        console.error("Error fetching covenant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCovenant();
  }, []);

  useEffect(() => {
    if (data) {
      const currentLang = i18n.language.split('-')[0]; // Normalize pt-BR to pt
      const langKey = currentLang === 'pt' ? 'content_pt' : 
                      currentLang === 'es' ? 'content_es' :
                      currentLang === 'nl' ? 'content_nl' : 'content_en';
      
      setContent(data[langKey] || data['content_en'] || 'Terms are currently unavailable.');
    }
  }, [data, i18n.language]);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <Link to={`/`} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-[0.3em] text-[10px] font-black">
            <ArrowLeft size={14} /> {t('common.back_home')}
          </Link>

          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  i18n.language.startsWith(lang.code) ? "bg-amber-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.code}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <FileText size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('covenant.label')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase">{t('nav.covenant')}</h1>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-16 rounded-[40px] border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="prose prose-invert max-w-none">
              <div 
                className="covenant-rich-content text-amber-100/70 leading-relaxed font-light text-lg md:text-xl"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-4">
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Legal Dept</p>
                   <p className="text-xs text-white/40">Holanbra Real Estate v1.0</p>
                </div>
             </div>
             
             <button 
               onClick={() => window.print()}
               className="px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-xl shadow-white/5 flex items-center gap-2"
             >
                <Printer size={14} />
                {t('covenant.print')}
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Covenant;
