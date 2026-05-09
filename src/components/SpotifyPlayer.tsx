import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Music, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export type RadioState = 'hidden' | 'modal' | 'minimized';

interface SpotifyPlayerProps {
  playlistId?: string;
  className?: string;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ 
  playlistId = "3JdwCkyfHAA3UkynLLxvOf",
  className
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<RadioState>('hidden');

  // Listen for custom events to control the radio from other components
  useEffect(() => {
    const handleToggle = (e: any) => {
      if (e.detail?.action === 'open') {
        setState('modal');
      } else if (e.detail?.action === 'close') {
        setState('minimized');
      } else if (e.detail?.action === 'stop') {
        setState('hidden');
      }
    };

    window.addEventListener('holanbra-radio', handleToggle);
    return () => window.removeEventListener('holanbra-radio', handleToggle);
  }, []);

  // If hidden, technically we should unmount to stop music, 
  // but the user wants to "stop" the player.
  if (state === 'hidden') return null;

  return (
    <>
      <AnimatePresence>
        {state === 'modal' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
            onClick={() => setState('minimized')}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={false}
        animate={state === 'modal' ? {
          width: 'min(calc(100vw - 48px), 448px)',
          height: '460px',
          bottom: '50%',
          right: '50%',
          x: '50%',
          y: '50%',
          borderRadius: '24px',
        } : {
          width: '320px',
          height: '132px',
          bottom: '32px',
          right: '32px',
          x: '0%',
          y: '0%',
          borderRadius: '16px',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          "fixed z-[10001] overflow-hidden bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col",
          className
        )}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Music size={14} className="text-amber-500 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white">{t('hero.radio')}</span>
              {state === 'modal' && <span className="text-[7px] font-medium text-white/40 uppercase tracking-widest">{t('resident.radio_selection', 'Resident Selection')}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state === 'modal' ? (
              <button 
                onClick={() => setState('minimized')}
                className="p-1.5 text-white/40 hover:text-white transition-colors bg-white/5 rounded-lg"
              >
                <Minimize2 size={14} />
              </button>
            ) : (
              <button 
                onClick={() => setState('modal')}
                className="p-1.5 text-white/40 hover:text-white transition-colors bg-white/5 rounded-lg"
              >
                <Maximize2 size={14} />
              </button>
            )}
            <button 
              onClick={() => setState('hidden')}
              className="p-1.5 text-white/40 hover:text-red-400 transition-colors bg-white/5 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-grow bg-black/20">
          <iframe 
            title="Spotify Player Persistent"
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&v=${Date.now()}`} 
            width="100%" 
            height={state === 'modal' ? "400" : "80"} 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            className="block"
          />
        </div>
      </motion.div>
    </>
  );
};
