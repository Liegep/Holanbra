import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList, BtnClearFormatting, BtnUndo, BtnRedo, BtnUnderline, BtnStyles } from 'react-simple-wysiwyg';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  Languages 
} from 'lucide-react';

interface AdminLandCovenantProps {
  covenants: { en: string, pt: string, es: string, nl: string };
  setCovenants: (val: any | ((prev: any) => any)) => void;
  isDirty: boolean;
  setIsDirty: (val: boolean) => void;
  handleSaveCovenant: () => void;
}

export function AdminLandCovenant({
  covenants,
  setCovenants,
  isDirty,
  setIsDirty,
  handleSaveCovenant
}: AdminLandCovenantProps) {
  const { t } = useTranslation();
  const [activeLang, setActiveLang] = useState<'en' | 'pt' | 'es' | 'nl'>('en');

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold font-display text-amber-500 tracking-tighter">{t('admin.covenant.title')}</h2>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px]">{t('admin.covenant.subtitle')}</p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {(['en', 'pt', 'es', 'nl'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                activeLang === lang 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest flex items-center gap-2">
              <Languages size={14} /> {t('admin.fields.language')} ({activeLang.toUpperCase()})
            </label>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <EditorProvider>
              <Editor 
                value={covenants[activeLang]}
                onChange={(e) => {
                  setCovenants((prev: any) => ({ ...prev, [activeLang]: e.target.value }));
                  setIsDirty(true);
                }}
                placeholder={t(`admin.covenant.placeholder_${activeLang}`)}
                className="min-h-[400px] text-white"
              >
                <Toolbar>
                  <BtnUndo />
                  <BtnRedo />
                  <BtnStyles />
                  <BtnBold />
                  <BtnItalic />
                  <BtnUnderline />
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

      <button 
        onClick={handleSaveCovenant}
        className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold uppercase tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
      >
        <Save size={18} /> {t('admin.covenant.update_button')}
      </button>

      <AnimatePresence>
        {isDirty && (
          <motion.button
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.8 }}
            onClick={handleSaveCovenant}
            className="fixed bottom-12 right-12 z-[150] px-10 py-5 rounded-full bg-amber-500 text-black font-black flex items-center gap-3 shadow-[0_15px_60px_rgba(245,158,11,0.5)] hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-[10px]"
          >
            <Save size={16} /> {t('admin.common.save')}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
