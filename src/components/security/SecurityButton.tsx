import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Power, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { SecurityDashboard } from './SecurityDashboard';
import { cn } from '../../lib/utils';

export function SecurityButton({ residentUuid, className }: { residentUuid?: string, className?: string }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 transition-all active:scale-95 text-left group",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Shield size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase text-white/30 tracking-widest">{t('security.title')}</span>
            <span className="block text-xs font-bold text-white tracking-tight">System Control</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/20 group-hover:text-amber-500 transition-colors" />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <SecurityDashboard 
              onClose={() => setIsOpen(false)} 
              residentUuid={residentUuid}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
