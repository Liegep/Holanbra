import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  HelpCircle,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList, BtnClearFormatting, BtnUndo, BtnRedo, BtnUnderline, BtnStyles } from 'react-simple-wysiwyg';

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

const INITIAL_FAQ: Omit<FAQ, 'id'> = {
  category: 'technical',
  display_order: 0,
  question_en: '',
  answer_en: '',
  question_pt: '',
  answer_pt: '',
  question_es: '',
  answer_es: '',
  question_nl: '',
  answer_nl: ''
};

export const AdminFAQManager: React.FC = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<FAQ, 'id'>>(INITIAL_FAQ);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'pt' | 'es' | 'nl'>('en');

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

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      category: faq.category,
      display_order: faq.display_order,
      question_en: faq.question_en,
      answer_en: faq.answer_en,
      question_pt: faq.question_pt,
      answer_pt: faq.answer_pt,
      question_es: faq.question_es,
      answer_es: faq.answer_es,
      question_nl: faq.question_nl,
      answer_nl: faq.answer_nl
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(INITIAL_FAQ);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([formData]);
        if (error) throw error;
      }
      
      setFormData(INITIAL_FAQ);
      setEditingId(null);
      fetchFAQs();
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      alert(t('admin.common.error.generic') + ': ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.faqs.delete_confirm'))) return;
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    }
  };

  const moveOrder = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    // Simple order swap logic could be added here
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">{t('admin.faqs.title')}</h2>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">{t('admin.faqs.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* FAQ Form */}
      <div className="glass-card p-8 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">{t('admin.faqs.category')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
              >
                <option value="technical" className="bg-zinc-900">{t('admin.faqs.categories.technical')}</option>
                <option value="land" className="bg-zinc-900">{t('admin.faqs.categories.land')}</option>
                <option value="billing" className="bg-zinc-900">{t('admin.faqs.categories.billing')}</option>
                <option value="others" className="bg-zinc-900">{t('admin.faqs.categories.others')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">{t('admin.faqs.order')}</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl self-start">
            {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeLang === lang ? "bg-amber-500 text-black" : "text-white/40 hover:text-white"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">
                {t('admin.faqs.question_label')} ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData[`question_${activeLang}` as keyof typeof formData] as string}
                onChange={(e) => setFormData({ ...formData, [`question_${activeLang}`]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
                placeholder={t('admin.faqs.question_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">
                {t('admin.faqs.answer_label')} ({activeLang.toUpperCase()})
              </label>
              <div className="bg-black rounded-xl border border-white/10 overflow-hidden min-h-[250px] text-left">
                <EditorProvider>
                  <Editor
                    value={formData[`answer_${activeLang}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`answer_${activeLang}`]: e.target.value })}
                    placeholder={t('admin.faqs.answer_placeholder')}
                    className="min-h-[200px] text-sm text-white"
                  >
                    <Toolbar>
                      <BtnUndo />
                      <BtnRedo />
                      <BtnStyles />
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <BtnLink />
                      <BtnBulletList />
                      <BtnNumberedList />
                      <BtnClearFormatting />
                    </Toolbar>
                  </Editor>
                </EditorProvider>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl",
                editingId ? "bg-white text-black hover:bg-amber-400" : "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20"
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : editingId ? (
                <Save size={16} />
              ) : (
                <Plus size={16} />
              )}
              {editingId ? t('admin.common.save') : t('admin.faqs.create_new')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={16} /> {t('admin.common.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of FAQs */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 border-white/5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 items-center">
                  <button onClick={() => moveOrder(faq.id, faq.display_order, 'up')} className="text-white/20 hover:text-amber-500 transition-colors">
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-amber-500/50">{faq.display_order}</span>
                  <button onClick={() => moveOrder(faq.id, faq.display_order, 'down')} className="text-white/20 hover:text-amber-500 transition-colors">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                      faq.category === 'technical' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      faq.category === 'land' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      faq.category === 'billing' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {t(`admin.faqs.categories.${faq.category}`)}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{faq.question_en}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-[6px] font-black uppercase text-white/20 w-4">Q:</span>
                      {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
                        <div 
                          key={lang}
                          title={`Question ${lang.toUpperCase()}`}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            faq[`question_${lang}`] ? "bg-amber-500" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[6px] font-black uppercase text-white/20 w-4">A:</span>
                      {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
                        <div 
                          key={lang}
                          title={`Answer ${lang.toUpperCase()}`}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            faq[`answer_${lang}`] ? "bg-amber-500" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {faqs.length === 0 && !loading && (
          <div className="glass-card p-12 text-center border-dashed border-white/5">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{t('admin.common.no_items')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
