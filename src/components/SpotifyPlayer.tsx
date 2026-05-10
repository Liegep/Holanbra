import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Music, X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for window resize to handle mobile states
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const spotifySrc = React.useMemo(() => {
    return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&v=${Date.now()}`;
  }, [playlistId]);

  // Handle iframe loading
  useEffect(() => {
    if (state !== 'hidden') {
      setIsLoading(true);
    }
  }, [state, spotifySrc]);

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
            className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-md"
            onClick={() => setState('minimized')}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={false}
        animate={state === 'modal' ? {
          width: isMobile ? '100%' : 'min(calc(100vw - 48px), 448px)',
          height: isMobile ? '60vh' : '480px',
          bottom: isMobile ? '0px' : '50%',
          right: isMobile ? '0px' : '50%',
          x: isMobile ? '0%' : '50%',
          y: isMobile ? '0%' : '50%',
          borderRadius: isMobile ? '24px 24px 0 0' : '32px',
        } : {
          width: isMobile ? '48px' : '320px',
          height: isMobile ? '48px' : '132px',
          bottom: isMobile ? '132px' : '110px',
          right: isMobile ? '16px' : '32px',
          x: '0%',
          y: '0%',
          borderRadius: isMobile ? '24px' : '20px',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed z-[10001] overflow-hidden bg-zinc-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] flex flex-col group transition-all duration-300",
          isMobile && state === 'minimized' && "border-none shadow-[0_0_20px_rgba(245,158,11,0.2)]",
          className
        )}
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(245,158,11,0.2)_0%,transparent_70%)]"
          />
        </div>

        <div className={cn(
          "px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md shrink-0 relative z-10 transition-all duration-500",
          isMobile && state === 'minimized' && "p-0 h-full w-full justify-center border-none bg-transparent"
        )}>
          <div className={cn("flex items-center gap-3", isMobile && state === 'minimized' && "gap-0")}>
            <div className="relative">
              <div 
                onClick={() => {
                  if (isMobile && state === 'minimized') {
                    setState('modal');
                  }
                }}
                className={cn(
                  "w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 transition-all",
                  isMobile && state === 'minimized' && "bg-amber-500/20 border-none cursor-pointer"
                )}
              >
                <motion.div
                  animate={state === 'minimized' ? {
                    y: [0, -4, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Music size={18} className="text-amber-500" />
                </motion.div>
              </div>
              {/* Audio Visualizer Indicator */}
              {!isLoading && (state !== 'minimized' || !isMobile) && (
                <div className="absolute -bottom-1 -right-1 flex items-end gap-[2px] h-3 px-1 bg-zinc-900 rounded-full border border-white/10">
                  <motion.div animate={{ height: [2, 8, 4] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} className="w-[2px] bg-amber-500" />
                  <motion.div animate={{ height: [4, 2, 8] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} className="w-[2px] bg-amber-500" />
                  <motion.div animate={{ height: [8, 4, 6] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }} className="w-[2px] bg-amber-500" />
                </div>
              )}
            </div>
            {(!isMobile || state === 'modal') && (
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90">{t('hero.radio')}</span>
                <AnimatePresence mode="wait">
                  {state === 'modal' && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[8px] font-bold text-amber-500/60 uppercase tracking-[0.2em]"
                    >
                      {t('resident.radio_selection', 'Marie Whitfield\'s Selection')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {(!isMobile || state === 'modal') && (
            <div className="flex items-center gap-2">
              {state === 'modal' ? (
                <button 
                  onClick={() => setState('minimized')}
                  className="p-2 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl active:scale-90"
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => setState('modal')}
                  className="p-2 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl active:scale-90"
                  title="Expand"
                >
                  <Maximize2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setState('hidden')}
                className="p-2 text-white/40 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 rounded-xl active:scale-90"
                title="Stop"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex-grow bg-black/40 relative",
          isMobile && state === 'minimized' ? "hidden" : "flex"
        )}>
          {/* Loading Skeleton */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 gap-4"
              >
                <div className="relative">
                  <Loader2 className="text-amber-500/20 animate-spin" size={48} strokeWidth={1} />
                  <Music className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={20} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      key="loader-bar"
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-1/2 bg-amber-500/40"
                    />
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Syncing Radio...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <iframe 
            ref={iframeRef}
            title="Spotify Player Persistent"
            src={spotifySrc} 
            width="100%" 
            height={state === 'modal' ? (isMobile ? "100%" : "420") : "80"} 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            className={cn(
              "block transition-opacity duration-700",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />
        </div>
      </motion.div>
    </>
  );
};
