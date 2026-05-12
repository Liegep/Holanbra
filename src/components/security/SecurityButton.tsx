import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { SecurityDashboard } from './SecurityDashboard';

export function SecurityButton({ residentUuid }: { residentUuid?: string }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewReply, setHasNewReply] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 group"
      >
        <Shield size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs uppercase tracking-widest">{t('security.title')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <SecurityDashboard 
            onClose={() => setIsOpen(false)} 
            residentUuid={residentUuid}
          />
        )}
      </AnimatePresence>
    </>
  );
}
