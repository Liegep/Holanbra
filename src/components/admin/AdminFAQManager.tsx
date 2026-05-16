import React, { useState, useEffect, useMemo } from 'react';
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
  Eye,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList, BtnClearFormatting, BtnUndo, BtnRedo, BtnUnderline, BtnStyles } from 'react-simple-wysiwyg';
import ReactMarkdown from 'react-markdown';

const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

interface GuideStep {
  id: string;
  title: string;
  content: string;
}

interface StructuredAnswer {
  type: 'structured';
  intro: string;
  steps: GuideStep[];
  footer: string;
  expertTip: string;
}

const INITIAL_STRUCTURED: StructuredAnswer = {
  type: 'structured',
  intro: '',
  steps: [{ id: generateId(), title: '', content: '' }],
  footer: '',
  expertTip: ''
};

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
  const [showPreview, setShowPreview] = useState(false);
  const [useStructured, setUseStructured] = useState<Record<string, boolean>>({
    en: false, pt: false, es: false, nl: false
  });

  const getStructuredData = (lang: string): StructuredAnswer => {
    const raw = formData[`answer_${lang}` as keyof typeof formData] as string;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.type === 'structured') {
        const stepsWithIds = parsed.steps.map((s: any) => ({
          ...s,
          id: s.id || generateId()
        }));
        return { ...parsed, steps: stepsWithIds };
      }
    } catch (e) {}
    return { ...INITIAL_STRUCTURED };
  };

  const currentSteps = useMemo(() => getStructuredData(activeLang).steps, [formData, activeLang]);

  const updateStructuredData = (lang: string, data: Partial<StructuredAnswer>) => {
    const current = getStructuredData(lang);
    const updated = { ...current, ...data };
    setFormData(prev => ({
      ...prev,
      [`answer_${lang}`]: JSON.stringify(updated)
    }));
  };

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
    const structuredState = { en: false, pt: false, es: false, nl: false };
    (['en', 'pt', 'es', 'nl'] as const).forEach(lang => {
      try {
        const val = faq[`answer_${lang}` as keyof FAQ] as string;
        const parsed = JSON.parse(val);
        if (parsed && parsed.type === 'structured') {
          structuredState[lang] = true;
        }
      } catch (e) {}
    });
    setUseStructured(structuredState);
    const { id, ...data } = faq;
    setFormData(data);
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
        const { error } = await supabase.from('faqs').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faqs').insert([formData]);
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
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
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
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-white/40">{t('admin.faqs.editor_mode', 'Editor Mode')}</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={useStructured[activeLang]}
                    onChange={(e) => setUseStructured(prev => ({ ...prev, [activeLang]: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    {useStructured[activeLang] ? 'Guide Builder' : 'Rich Text'}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">{t('admin.faqs.question_label')} ({activeLang.toUpperCase()})</label>
              <input
                type="text"
                value={formData[`question_${activeLang}` as keyof typeof formData] as string}
                onChange={(e) => setFormData({ ...formData, [`question_${activeLang}`]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
                placeholder={t('admin.faqs.question_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-amber-500">{t('admin.faqs.answer_label')} ({activeLang.toUpperCase()})</label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    showPreview ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  <Eye size={12} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              {showPreview && (
                <div className="p-8 bg-[#0a0a0a] border border-amber-500/20 rounded-3xl mb-6 rich-content">
                  {useStructured[activeLang] ? (
                    <div className="space-y-8">
                      {getStructuredData(activeLang).intro && <ReactMarkdown>{getStructuredData(activeLang).intro}</ReactMarkdown>}
                      <div className="space-y-6">
                        {getStructuredData(activeLang).steps.map((step, idx) => (
                          <div key={idx} className="relative pl-12 border-l border-white/5 pb-2">
                            <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                            <h5 className="text-lg font-bold text-amber-500 mb-2">{step.title || 'Step ' + (idx + 1)}</h5>
                            <ReactMarkdown>{step.content}</ReactMarkdown>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ReactMarkdown>{formData[`answer_${activeLang}` as keyof typeof formData] as string}</ReactMarkdown>
                  )}
                </div>
              )}

              {useStructured[activeLang] ? (
                <div className="space-y-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                  <textarea
                    value={getStructuredData(activeLang).intro}
                    onChange={(e) => updateStructuredData(activeLang, { intro: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                    placeholder="Intro..."
                  />
                  <Reorder.Group axis="y" values={currentSteps} onReorder={(newSteps) => updateStructuredData(activeLang, { steps: newSteps })} className="space-y-3">
                    {currentSteps.map((step, idx) => (
                      <Reorder.Item key={step.id} value={step} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <GripVertical size={16} className="text-white/20 cursor-grab active:cursor-grabbing" />
                          <button type="button" onClick={() => updateStructuredData(activeLang, { steps: currentSteps.filter(s => s.id !== step.id) })} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                        <input
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...currentSteps];
                            newSteps[idx].title = e.target.value;
                            updateStructuredData(activeLang, { steps: newSteps });
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                          placeholder="Step title..."
                        />
                        <textarea
                          value={step.content}
                          onChange={(e) => {
                            const newSteps = [...currentSteps];
                            newSteps[idx].content = e.target.value;
                            updateStructuredData(activeLang, { steps: newSteps });
                          }}
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                          placeholder="Step content..."
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                  <button type="button" onClick={() => updateStructuredData(activeLang, { steps: [...currentSteps, { id: generateId(), title: '', content: '' }] })} className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"><Plus size={14} className="inline mr-2" /> Add Step</button>
                </div>
              ) : (
                <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
                  <EditorProvider>
                    <Editor
                      value={formData[`answer_${activeLang}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`answer_${activeLang}`]: e.target.value })}
                      className="min-h-[200px] text-white"
                    >
                      <Toolbar><BtnUndo /><BtnRedo /><BtnStyles /><BtnBold /><BtnItalic /><BtnUnderline /><BtnLink /><BtnBulletList /><BtnNumberedList /><BtnClearFormatting /></Toolbar>
                    </Editor>
                  </EditorProvider>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-amber-400">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? t('admin.common.save') : t('admin.faqs.create_new')}
            </button>
            {editingId && <button type="button" onClick={handleCancel} className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all"><X size={16} /></button>}
          </div>
        </form>
      </div>

      <div className="space-y-4 pt-8">
        <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] ml-1">Current FAQs</h3>
        <Reorder.Group axis="y" values={faqs} onReorder={async (newFaqs) => {
          setFaqs(newFaqs);
          try {
            const updates = newFaqs.map((f, i) => ({ ...f, display_order: i }));
            const { error } = await supabase.from('faqs').upsert(updates, { onConflict: 'id' });
            if (error) throw error;
          } catch (err) { console.error('Error updating order:', err); }
        }} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {faqs.map((faq) => (
              <Reorder.Item key={faq.id} value={faq} className="glass-card p-6 border-white/5 flex items-center justify-between group touch-none hover:border-amber-500/10">
                <div className="flex items-center gap-6">
                  <GripVertical size={20} className="text-white/10 cursor-grab active:cursor-grabbing hover:text-amber-500 transition-colors" />
                  <div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">{t(`admin.faqs.categories.${faq.category}`)}</span>
                    <h4 className="text-lg font-bold text-white mt-1">{faq.question_en}</h4>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(faq)} className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white hover:text-black transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
};
