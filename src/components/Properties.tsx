import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowUpRight, DollarSign, Heart, ExternalLink, X, ChevronLeft, ChevronRight, Loader2, Key } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  status: 'available' | 'rented' | 'reserved';
  image: string;
  gallery: Array<{ type: 'image' | 'video'; url: string }>;
  slurl: string;
  teleport_url?: string;
  date: string;
  casperletId?: string;
  rental_price?: number;
  expiry_date?: string;
  property_type?: string[];
  description?: string;
  description_pt?: string;
  description_en?: string;
  description_es?: string;
  description_nl?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [filter, setFilter] = useState({
    type: 'All',
    status: 'all',
    maxPrice: 50000,
    sortBy: 'newest'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');
      
      if (error) {
        console.error(error);
        setLoading(false);
      } else {
        const propertyList = (data || []).map(p => {
          const galleryList = [];
          
          // Construct gallery from explicit columns
          if (p.image_url) galleryList.push({ type: 'image', url: p.image_url });
          if (p.gallery_image_1) galleryList.push({ type: 'image', url: p.gallery_image_1 });
          if (p.gallery_image_2) galleryList.push({ type: 'image', url: p.gallery_image_2 });
          
          // Legacy support
          if (galleryList.length === 0 && p.image) {
            galleryList.push({ type: 'image', url: p.image });
          }

          return {
            ...p,
            casperletId: p.casperlet_id,
            image: p.image_url,
            price: p.rental_price || p.price || 0,
            gallery: galleryList,
            teleport_url: p.teleport_url || p.slurl // Fallback
          };
        });
        setProperties(propertyList);
        setLoading(false);
      }
    };

    fetchProperties();

    const propertiesSubscription = supabase
      .channel('properties_public_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchProperties)
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesSubscription);
    };
  }, []);

  const sortedAndFilteredProperties = [...properties]
    .filter(p => {
      let typeMatch = filter.type === 'All';
      if (!typeMatch) {
        if (p.property_type && Array.isArray(p.property_type)) {
          typeMatch = p.property_type.includes(filter.type);
        } else {
          // Fallback legacy logic
          typeMatch = (filter.type === 'Land' && !p.name.toLowerCase().includes('loft')) || 
                      (filter.type === 'Furnished' && p.name.toLowerCase().includes('loft'));
        }
      }
      const statusMatch = filter.status === 'all' || p.status === filter.status;
      const priceMatch = p.price <= filter.maxPrice;
      return typeMatch && statusMatch && priceMatch;
    })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name-az': return a.name.localeCompare(b.name);
        case 'name-za': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const openGallery = (property: any) => {
    setSelectedProperty(property);
    setCurrentImgIdx(0);
  };

  const nextImg = () => {
    if (!selectedProperty) return;
    setCurrentImgIdx((prev) => (prev + 1) % selectedProperty.gallery.length);
  };

  const prevImg = () => {
    if (!selectedProperty) return;
    setCurrentImgIdx((prev) => (prev - 1 + selectedProperty.gallery.length) % selectedProperty.gallery.length);
  };

  const getLocalizedDescription = (p: any) => {
    return p.description_en || p.description || "Experience unparalleled luxury and comfort in Holanbra.";
  };

  return (
    <section id="properties" className="py-32 px-6 md:px-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4 text-left">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-black">Available Properties</h2>
            <div className="space-y-2">
              <p className="text-amber-600/60 max-w-lg text-sm uppercase tracking-widest font-medium">
                Find your next virtual home.
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                {properties.filter(p => p.status === 'available').length} {properties.filter(p => p.status === 'available').length === 1 ? 'Property' : 'Properties'} ready for occupancy
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['All', 'Land', 'Furnished'].map((typeName) => (
                <button 
                  key={typeName}
                  onClick={() => setFilter({ ...filter, type: typeName })}
                  className={cn(
                    "px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter.type === typeName ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" : "bg-black/5 border-black/5 text-black/60 hover:text-black"
                  )}
                >
                  {typeName}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <select 
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-6 py-2 rounded-full bg-black/5 border-black/5 text-[10px] font-bold uppercase tracking-widest text-black/60 outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
              </select>

              <select 
                value={filter.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                className="px-6 py-2 rounded-full bg-black/5 border-black/5 text-[10px] font-bold uppercase tracking-widest text-black/60 outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
              >
                <option value="price-low">Price (Lowest)</option>
                <option value="price-high">Price (Highest)</option>
                <option value="name-az">Name (A-Z)</option>
                <option value="name-za">Name (Z-A)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-black/5 border-black/5 rounded-full px-6 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">up to L$ {filter.maxPrice}</span>
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="500"
                value={filter.maxPrice}
                onChange={(e) => setFilter({ ...filter, maxPrice: parseInt(e.target.value) })}
                className="w-24 accent-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedAndFilteredProperties.map((property, idx) => (
            <motion.div 
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bento-card group h-[450px] cursor-pointer",
                idx === 0 && filter.type === 'All' ? "lg:col-span-1 md:col-span-2" : ""
              )}
              onClick={() => openGallery(property)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
              <img 
                src={property.image} 
                alt={property.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute bottom-8 left-8 right-8 z-20 space-y-3 text-left">
                <div className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase rounded-md w-fit mb-3",
                  property.status === 'available' ? "bg-amber-500 text-black" : "bg-white/20 text-white"
                )}>
                  {property.status === 'available' ? 'Available' : 'Rented'}
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-white">{property.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  HOLANBRA | PRIMA OCEAN
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="text-2xl font-light text-white decoration-amber-500/50">
                    L$ {property.price} <span className="text-[10px] uppercase font-bold tracking-tighter opacity-60">/ week</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(property.teleport_url || property.slurl, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
                  >
                    <MapPin size={12} />
                    Teleport
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openGallery(property);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                  >
                    <ExternalLink size={12} />
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {sortedAndFilteredProperties.length === 0 && (
            <div className="col-span-full py-20 text-center bg-black/5 rounded-[2rem] border-2 border-dashed border-black/10">
              <p className="text-black/40 uppercase tracking-[0.3em] font-bold text-sm">No properties found</p>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-12">
           <button className="px-12 py-5 rounded-full border border-black/10 hover:border-amber-500/50 bg-black/5 text-[10px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-3 transition-all hover:bg-amber-500/5">
             View All Properties <ExternalLink size={16} className="text-amber-500" />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-10"
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full h-full max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white text-black shadow-2xl flex flex-col md:flex-row border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Section */}
              <div className="w-full md:w-[60%] h-[40%] md:h-full relative bg-zinc-100">
                {/* Main Media with smooth transition */}
                <div className="w-full h-full relative group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImgIdx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      {selectedProperty.gallery[currentImgIdx]?.type === 'video' ? (
                        <video 
                          src={selectedProperty.gallery[currentImgIdx].url} 
                          className="w-full h-full object-cover" 
                          controls 
                          autoPlay 
                          loop
                        />
                      ) : (
                        <img 
                          src={selectedProperty.gallery[currentImgIdx]?.url} 
                          alt={selectedProperty.name}
                          className="w-full h-full object-cover shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {selectedProperty.gallery.length > 1 && (
                    <>
                      <button 
                        onClick={prevImg}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={nextImg}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Gallery Thumbnails positioned at the bottom of the image area */}
                  {selectedProperty.gallery.length > 1 && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-40">
                      {selectedProperty.gallery.map((img: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setCurrentImgIdx(i)}
                          className={cn(
                            "w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shadow-xl",
                            i === currentImgIdx ? "border-amber-500 ring-4 ring-amber-500/20 scale-105" : "border-white/20 opacity-70 hover:opacity-100 hover:scale-105"
                          )}
                        >
                          <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-8 inset-x-0 flex justify-center gap-2">
                  {selectedProperty.gallery.map((_: any, i: number) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i === currentImgIdx ? "w-6 bg-white" : "bg-white/40"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-[40%] h-[60%] md:h-full bg-white p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase rounded-md w-fit",
                        selectedProperty.status === 'available' ? "bg-amber-500 text-black" : "bg-zinc-100 text-zinc-400"
                      )}>
                        {selectedProperty.status === 'available' ? 'Available' : 'Rented'}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-display font-bold leading-none tracking-tight text-black">
                        {selectedProperty.name}
                      </h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/60">
                         HOLANBRA
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedProperty(null)}
                      className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-black"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-3xl font-display font-medium text-black">
                      L$ {selectedProperty.price} <span className="text-xs uppercase font-black tracking-widest text-black/30">/ week</span>
                    </div>
                    
                    <div className="flex gap-4">
                      {selectedProperty.bedrooms !== undefined && selectedProperty.bedrooms > 0 && (
                        <div className="px-4 py-2 bg-zinc-100 rounded-xl">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{selectedProperty.bedrooms} BEDROOMS</span>
                        </div>
                      )}
                      {selectedProperty.bathrooms !== undefined && selectedProperty.bathrooms > 0 && (
                        <div className="px-4 py-2 bg-zinc-100 rounded-xl">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{selectedProperty.bathrooms} BATHROOMS</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-3">Description</h3>
                      <p className="text-sm text-zinc-600 leading-relaxed font-light">
                        {getLocalizedDescription(selectedProperty)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-3">
                  <button 
                    onClick={() => window.open(selectedProperty.teleport_url || selectedProperty.slurl, '_blank')}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/30"
                  >
                    <MapPin size={18} />
                    Teleport Now
                  </button>
                  
                  {selectedProperty.status === 'available' && (
                    <button 
                      onClick={() => {
                        // @ts-ignore
                        if (window.Tawk_API) {
                          // @ts-ignore
                          window.Tawk_API.maximize();
                          // Set pre-filled message if possible or just maximize
                          console.log("Contacting agent for property:", selectedProperty.name);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      CONTACT AGENT
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
