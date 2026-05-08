import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface GalleryItem {
  id: string;
  url: string;
  type?: 'image' | 'video';
  caption?: string;
}

const MediaItem = ({ item, index, onClick }: { item: GalleryItem, index: number, onClick: () => void }) => {
  const [isInView, setIsInView] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isVideo = item.type === 'video' || item.url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-6 relative group cursor-pointer overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5 min-h-[200px]"
      onClick={onClick}
    >
      {isInView ? (
        isVideo ? (
          <video
            src={item.url}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img 
            src={item.url} 
            alt={item.caption || 'Holanbra Gallery item'} 
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
        )
      ) : (
        <div className="w-full aspect-video bg-zinc-800 animate-pulse" />
      )}
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Maximize2 className="text-amber-500" size={32} />
      </div>
      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{item.caption}</p>
        </div>
      )}
    </motion.div>
  );
};

export default function Gallery() {
  const { t } = useTranslation();

  const DEFAULT_IMAGES: GalleryItem[] = [
    { id: 'def-1', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=800&q=80', caption: 'Luxury Shoreline' },
    { id: 'def-2', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=1200&q=80', caption: 'Modern Architecture' },
    { id: 'def-3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&q=80', caption: 'Sunset View' },
    { id: 'def-4', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=1000&q=80', caption: 'Garden Oasis' },
    { id: 'def-5', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&h=800&q=80', caption: 'Exclusive Lounge' },
    { id: 'def-6', url: 'https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=800&h=1100&q=80', caption: 'Serene Forest' },
    { id: 'def-7', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=1000&q=80', caption: 'Estate View' },
    { id: 'def-8', url: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1200&h=800&q=80', caption: 'Minimalist Design' }
  ];

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*');
      
      if (data) {
        setImages(data as GalleryItem[]);
      }
    };

    fetchGallery();

    const gallerySubscription = supabase
      .channel('gallery_public_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchGallery)
      .subscribe();

    return () => {
      supabase.removeChannel(gallerySubscription);
    };
  }, []);

  const displayImages = useMemo(() => {
    const source = images.length > 0 ? images : DEFAULT_IMAGES;
    return shuffleArray(source);
  }, [images]);

  return (
    <section id="gallery" className="py-32 bg-black scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">{t('gallery.atmosphere')}</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter italic">
            {t('gallery.title1')} <span className="font-light not-italic">{t('gallery.title2')}</span>
          </h2>
          <p className="text-amber-100/40 max-w-lg mx-auto text-sm uppercase tracking-widest font-medium pt-2">
            {t('gallery.subtitle')}
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {displayImages.map((item, index) => (
            <MediaItem 
              key={item.id} 
              item={item} 
              index={index} 
              onClick={() => setSelectedImage(item)} 
            />
          ))}
        </div>
      </div>


      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl w-full max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {(selectedImage.type === 'video' || selectedImage.url.match(/\.(mp4|webm|ogg)$/i)) ? (
                <video 
                  src={selectedImage.url} 
                  className="w-full h-full object-contain rounded-2xl"
                  controls
                  autoPlay
                />
              ) : (
                <img 
                  src={selectedImage.url} 
                  className="w-full h-full object-contain rounded-2xl"
                  alt={selectedImage.caption || 'Holanbra Gallery detailed view'}
                  referrerPolicy="no-referrer"
                />
              )}
              {selectedImage.caption && (
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <p className="text-white text-sm font-bold uppercase tracking-[0.4em]">{selectedImage.caption}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
