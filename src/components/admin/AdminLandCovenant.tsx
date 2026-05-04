import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-wysiwyg';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  List as ListIcon, 
  Link as LinkIcon 
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
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionRect(rect);
      } else {
        setSelectionRect(null);
      }
    }, 10);
  };

  const applyCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    setIsDirty(true);
  };

  const FloatingToolbar = () => {
    if (!selectionRect) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="floating-toolbar fixed z-[10000] flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl"
        style={{ 
          top: selectionRect.top - 60, 
          left: Math.max(10, Math.min(window.innerWidth - 320, selectionRect.left + (selectionRect.width / 2) - 160)) 
        }}
      >
        <button onClick={() => applyCommand('bold')} className="p-2 hover:bg-white/5 rounded text-white" title="Bold"><Bold size={14} /></button>
        <button onClick={() => applyCommand('italic')} className="p-2 hover:bg-white/5 rounded text-white" title="Italic"><Italic size={14} /></button>
        <button onClick={() => applyCommand('underline')} className="p-2 hover:bg-white/5 rounded text-white" title="Underline"><Underline size={14} /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button onClick={() => applyCommand('insertUnorderedList')} className="p-2 hover:bg-white/5 rounded text-white" title="List"><ListIcon size={14} /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <select 
          className="bg-zinc-800 text-white text-[10px] p-1 rounded outline-none"
          onChange={(e) => applyCommand('formatBlock', e.target.value)}
          defaultValue="P"
        >
          <option value="P">{t('admin.covenant.type_text')}</option>
          <option value="H1">H1</option>
          <option value="H2">H2</option>
          <option value="H3">H3</option>
        </select>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button onClick={() => {
          const url = prompt(t('admin.covenant.link_prompt'));
          if (url) applyCommand('createLink', url);
        }} className="p-2 hover:bg-white/5 rounded text-white" title="Link"><LinkIcon size={14} /></button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold font-display text-amber-500 tracking-tighter">{t('admin.covenant.title')}</h2>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px]">{t('admin.covenant.subtitle')}</p>
        </div>
      </div>

      <FloatingToolbar />

      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">{t('admin.fields.language')} (EN)</label>
          <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
            <Editor 
              value={covenants.en}
              onChange={(e: any) => {
                setCovenants((prev: any) => ({ ...prev, en: e.target.value }));
                setIsDirty(true);
              }}
              placeholder={t('admin.covenant.placeholder_en')}
            />
          </div>
        </div>
        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">{t('admin.fields.language')} (PT)</label>
          <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
            <Editor 
              value={covenants.pt}
              onChange={(e: any) => {
                setCovenants((prev: any) => ({ ...prev, pt: e.target.value }));
                setIsDirty(true);
              }}
              placeholder={t('admin.covenant.placeholder_pt')}
            />
          </div>
        </div>
        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">{t('admin.fields.language')} (ES)</label>
          <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
            <Editor 
              value={covenants.es}
              onChange={(e: any) => {
                setCovenants((prev: any) => ({ ...prev, es: e.target.value }));
                setIsDirty(true);
              }}
              placeholder={t('admin.covenant.placeholder_es')}
            />
          </div>
        </div>
        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">{t('admin.fields.language')} (NL)</label>
          <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
            <Editor 
              value={covenants.nl}
              onChange={(e: any) => {
                setCovenants((prev: any) => ({ ...prev, nl: e.target.value }));
                setIsDirty(true);
              }}
              placeholder={t('admin.covenant.placeholder_nl')}
            />
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
