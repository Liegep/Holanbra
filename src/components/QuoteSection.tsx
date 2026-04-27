import { motion } from 'motion/react';

export default function QuoteSection() {
  return (
    <section className="py-60 bg-black text-center px-6 overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto relative z-10"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500/30 mb-12 block">Philosophy</span>
        <h2 className="text-4xl md:text-7xl font-display font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto">
          "Home is not just a place; <br className="hidden md:block" /> 
          <span className="italic text-amber-400 font-light">it's a feeling of warmth, a refuge of love,</span> <br className="hidden md:block" />
          and the canvas upon which lives unfold."
        </h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 text-white/20 text-xs font-bold uppercase tracking-[0.4em]"
        >
          Curated Virtual Living • Second Life Elite
        </motion.p>
      </motion.div>
      
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[40vh] bg-amber-500/[0.03] blur-[150px] pointer-events-none rounded-full"></div>
    </section>
  );
}
