import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Code, 
  Globe, 
  Shield, 
  Layout,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FAQ {
  id: string;
  category: string;
  display_order: number;
  question_en: string;
  answer_en: string;
  question_pt: string;
  answer_pt: string;
  question_es: string;
  answer_es: string;
  question_nl: string;
  answer_nl: string;
}

const CATEGORY_INFO: Record<string, { icon: any; color: string; border: string; text: string; bg: string; glow: string }> = {
  technical: { icon: Code, color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20', text: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
  land: { icon: Layers, color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
  billing: { icon: Shield, color: 'from-rose-500/20 to-orange-500/10', border: 'border-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' },
  others: { icon: HelpCircle, color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
};

export const FAQDisplay: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setFaqs(data || []);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const getLocalizedField = (faq: FAQ, field: 'question' | 'answer'): string => {
    // Current language
    const currentLang = i18n.language.split('-')[0].toLowerCase();
    
    // List of keys to check in order of priority
    const priorityKeys = [
      `${field}_${currentLang}`,
      `${field}_en`,
      `${field}_pt`,
      `${field}_es`,
      `${field}_nl`
    ];

    for (const k of priorityKeys) {
      const val = faq[k as keyof FAQ];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        return val;
      }
    }

    return '';
  };

  const filteredFaqs = faqs.filter(faq => {
    const question = getLocalizedField(faq, 'question').toLowerCase();
    const answer = getLocalizedField(faq, 'answer').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = question.includes(query) || answer.includes(query);
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'technical', 'land', 'billing', 'others'];

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t('admin.hero.loading', 'Loading Guides...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search and Filter */}
      <div className="flex flex-col gap-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-white/5 to-amber-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-white/20 group-focus-within:text-amber-500/50 transition-colors" size={24} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('resident.search_help', 'Search for help...')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white text-lg focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
            />
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map(cat => {
            const info = CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO];
            const Icon = info?.icon || Layout;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border shrink-0",
                  isActive 
                    ? "bg-amber-500 text-black border-amber-400 shadow-xl shadow-amber-500/20 scale-105" 
                    : cn(
                        "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white",
                        info ? info.border : ""
                      )
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-black/10" : info ? info.bg : "bg-white/5"
                )}>
                  <Icon size={14} className={isActive ? "text-black" : info ? info.text : "text-white/20"} />
                </div>
                {cat === 'all' ? t('properties.filter_all') : t(`admin.faqs.categories.${cat}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const question = getLocalizedField(faq, 'question');
            const answer = getLocalizedField(faq, 'answer');
            const info = CATEGORY_INFO[faq.category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.others;
            const Icon = info.icon;

            return (
              <div 
                key={faq.id}
                className={cn(
                  "relative group transition-all duration-500",
                  isExpanded ? "scale-[1.02] z-10" : "hover:scale-[1.01]"
                )}
              >
                {/* Decorative background glow */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn("absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r blur-2xl opacity-10", info.color)}
                    />
                  )}
                </AnimatePresence>

                <div className={cn(
                  "relative bg-[#0A0A0A] border rounded-[2rem] overflow-hidden transition-all duration-500",
                  isExpanded ? cn("border-amber-500/50 shadow-2xl", info.glow) : "border-white/5 group-hover:border-white/10"
                )}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full p-8 flex items-center justify-between text-left group/btn"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                        isExpanded ? "bg-amber-500 text-black rotate-12 shadow-inner" : cn("bg-white/5 text-white/40 group-hover/btn:scale-110", info.bg, info.text)
                      )}>
                        {isExpanded && (
                          <motion.div 
                            layoutId={`glow-${faq.id}`}
                            className="absolute inset-0 bg-white/20 blur-xl"
                          />
                        )}
                        <div className="relative z-10">
                          <Icon size={28} strokeWidth={isExpanded ? 2.5 : 1.5} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn("text-[8px] font-black uppercase tracking-[0.4em]", info.text)}>
                            {t(`admin.faqs.categories.${faq.category}`)}
                          </span>
                          <div className={cn("w-1 h-1 rounded-full", isExpanded ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/10")} />
                        </div>
                        <h4 className={cn(
                          "text-2xl font-bold tracking-tight leading-tight transition-colors duration-500",
                          isExpanded ? "text-white" : "text-white/60 group-hover/btn:text-white"
                        )}>
                          {question}
                        </h4>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 shrink-0",
                      isExpanded 
                        ? "rotate-180 bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20" 
                        : "border-white/10 text-white/20 group-hover/btn:text-white group-hover/btn:border-white/30"
                    )}>
                      <ChevronDown size={24} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-8 pb-10 pt-2">
                          <div className={cn("h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-10 transition-all duration-1000", isExpanded ? "via-amber-500/50" : "")} />
                          <div className="max-w-3xl md:ml-24">
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-white/80 faq-rich-content"
                            >
                              {answer ? (
                                <div dangerouslySetInnerHTML={{ __html: answer }} />
                              ) : (
                                <span className="text-white/30 italic">No answer available for this language</span>
                              )}
                            </motion.div>
                            
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6"
                            >
                               <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-amber-500 transition-all hover:gap-4 group/helpful">
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/helpful:bg-amber-500 group-hover/helpful:text-black transition-colors">
                                    <ArrowUpRight size={14} />
                                  </div>
                                  {t('admin.hero.helpful_q', 'Was this helpful?')}
                               </button>
                               
                               <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                 <div className="flex items-center gap-2">
                                   <span className="text-[8px] font-black uppercase tracking-widest text-white/20 px-2 py-0.5 bg-white/5 rounded leading-none">Guide</span>
                                   <span className="text-[10px] font-mono text-white/40 tracking-tighter">#{faq.id.slice(0, 8)}</span>
                                 </div>
                                 <div className="w-1 h-1 rounded-full bg-white/10" />
                                 <div className="flex items-center gap-1">
                                   <Globe size={10} className="text-white/20" />
                                   <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{i18n.language.split('-')[0]}</span>
                                 </div>
                               </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="text-white/20" size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold">{t('admin.faqs.no_results', 'No matching guides found')}</p>
              <p className="text-white/40 text-sm">{t('admin.faqs.search_tip', 'Try using different keywords or categories.')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Global Support CTA */}
      <div className="bg-amber-500 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
        </div>
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <h3 className="text-3xl font-display font-bold text-black tracking-tighter">
            {t('resident.still_need_help', 'Still need assistance?')}
          </h3>
          <p className="text-black/60 font-medium">{t('admin.faqs.support_cta', 'Our support staff is ready to help you with any specific issue.')}</p>
        </div>
        <button 
           onClick={() => {
             // We can pass a prop to ResidentDashboard to switch tabs, 
             // but for now, we'll just advise using the support tab or wait for parent integration
             window.scrollTo({ top: 300, behavior: 'smooth' });
           }}
           className="px-8 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-zinc-900 transition-all shadow-2xl relative z-10"
        >
          <MessageSquare size={16} /> {t('resident.support')}
        </button>
      </div>
    </div>
  );
};

// Internal icon for consistency if not imported
const MessageSquare = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
