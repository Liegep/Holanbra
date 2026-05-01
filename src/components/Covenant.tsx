import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { FileText, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Covenant: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'pt' | 'es' | 'nl'>('en');
  const [content, setContent] = useState({ en: '', pt: '', es: '', nl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCovenant = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'covenant')
          .maybeSingle();
        
        if (data) {
          const contentData = data.content || data;
          setContent({
            en: contentData.en || '',
            pt: contentData.pt || '',
            es: contentData.es || '',
            nl: contentData.nl || ''
          });
        }
      } catch (error) {
        console.error("Error fetching covenant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCovenant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const getLanguageName = (l: string) => {
    switch(l) {
      case 'en': return 'English';
      case 'pt': return 'Português';
      case 'es': return 'Español';
      case 'nl': return 'Nederlands';
      default: return l;
    }
  };

  const getNoTextMsg = (l: string) => {
    switch(l) {
      case 'en': return "Covenant text not yet available.";
      case 'pt': return "Texto do covenant ainda não disponível.";
      case 'es': return "El texto del convenio aún no está disponible.";
      case 'nl': return "Convenanttekst nog niet beschikbaar.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-[0.3em] text-[10px] font-black mb-12">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <FileText size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resident Terms</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">COVENANT</h1>
          </div>

          <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-md justify-center">
            {(['en', 'pt', 'es', 'nl'] as const).map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'}`}
              >
                {getLanguageName(l)}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={lang}
          className="glass-card p-8 md:p-16 rounded-[40px] border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-amber-100/70 leading-relaxed font-light text-lg md:text-xl space-y-6">
                {content[lang] || getNoTextMsg(lang)}
              </div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Globe className="text-emerald-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Legal Department</p>
                  <p className="text-xs text-white/40">Holanbra Real Estate v1.0</p>
                </div>
             </div>
             
             <button className="px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-xl shadow-white/5">
                Print Document
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Covenant;
