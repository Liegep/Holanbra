import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, MapPin } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Hero() {
  const [content, setContent] = useState<any>({
    backgroundImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    badgeText: 'New Islands Available',
    title1: 'Holanbra',
    title2: 'Sims',
    gridImages: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'
    ]
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docRef = doc(db, 'settings', 'hero');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching hero content:", err);
      }
    };
    fetchHero();
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Video/Image Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10"></div>
        <img 
          src={content.backgroundImage} 
          alt="Paradise" 
          className="w-full h-full object-cover opacity-60 scale-110 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {content.badgeText}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-6xl mx-auto px-4 space-y-12"
        >
          <div className="flex flex-col items-center gap-8 mb-4">
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono tracking-[0.6em] text-white/40 uppercase mb-4">Welcome to</span>
                <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-white flex flex-col items-center">
                  <span className="text-amber-500">{content.title1}</span>
                  <span className="italic font-light flex items-center gap-4">
                    {content.title2} <ArrowRight size={48} className="text-white/20" />
                  </span>
                </h2>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
             {content.gridImages.map((url: string, idx: number) => (
               <div key={idx} className={cn("rounded-2xl overflow-hidden shadow-2xl", idx % 2 !== 0 && "translate-y-8")}>
                  <img src={url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={`Hero grid ${idx}`} referrerPolicy="no-referrer" />
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button className="group px-10 py-5 rounded-full bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-amber-400 transition-all transform hover:scale-105 shadow-[0_10px_40px_rgba(245,158,11,0.3)]">
            Explore Catalog <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-10 py-5 rounded-full glass border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={10} fill="white" />
            </div>
            Virtual Tour
          </button>
        </motion.div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
}
