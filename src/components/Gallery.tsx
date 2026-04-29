import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  created_at: string;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  { id: 'def-1', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80', caption: 'Lakeside Living', created_at: new Date().toISOString() },
  { id: 'def-2', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80', caption: 'Sunset Views', created_at: new Date().toISOString() },
  { id: 'def-3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', caption: 'Coastal Paradise', created_at: new Date().toISOString() },
  { id: 'def-4', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', caption: 'Modern Interiors', created_at: new Date().toISOString() },
  { id: 'def-5', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', caption: 'Infinite Pools', created_at: new Date().toISOString() },
  { id: 'def-6', url: 'https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=800&q=80', caption: 'Private Islands', created_at: new Date().toISOString() }
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setImages(data as GalleryImage[]);
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

  const displayImages = images.length > 0 ? images : DEFAULT_IMAGES;

  return (
    <section id="gallery" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Atmosphere</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter italic">
            LIFE AT <span className="font-light not-italic">HOLANBRA</span>
          </h2>
          <p className="text-amber-100/40 max-w-lg mx-auto text-sm uppercase tracking-widest font-medium pt-2">
            Moments captured across our islands
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-[2rem] bg-zinc-900"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={image.url} 
                alt={image.caption || 'Holanbra Gallery'} 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white" size={32} />
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{image.caption}</p>
                </div>
              )}
            </motion.div>
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
              <img 
                src={selectedImage.url} 
                className="w-full h-full object-contain rounded-2xl"
                alt="Selected Gallery"
                referrerPolicy="no-referrer"
              />
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
