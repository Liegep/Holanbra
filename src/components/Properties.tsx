import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowUpRight, DollarSign, Heart, ExternalLink, X, ChevronLeft, ChevronRight, Loader2, Key } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  status: 'available' | 'rented' | 'reserved';
  image: string;
  gallery: Array<{ type: 'image' | 'video'; url: string }>;
  slurl: string;
  date: string;
  casperletId?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [filter, setFilter] = useState({
    type: 'All',
    status: 'all',
    maxPrice: 3000,
    sortBy: 'newest'
  });

  useEffect(() => {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propertyList: Property[] = [];
      snapshot.forEach((doc) => {
        propertyList.push({ id: doc.id, ...doc.data() } as Property);
      });
      setProperties(propertyList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sortedAndFilteredProperties = [...properties]
    .filter(p => {
      const typeMatch = filter.type === 'All' || (filter.type === 'Lands' && !p.name.toLowerCase().includes('loft')) || (filter.type === 'Furnished' && p.name.toLowerCase().includes('loft'));
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
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        default: return new Date(b.date).getTime() - new Date(a.date).getTime();
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

  return (
    <section id="imoveis" className="py-32 px-6 md:px-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4 text-left">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-black">Available Properties</h2>
            <div className="space-y-2">
              <p className="text-amber-600/60 max-w-lg text-sm uppercase tracking-widest font-medium">
                Find your next place.
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                {properties.filter(p => p.status === 'available').length} {properties.filter(p => p.status === 'available').length === 1 ? 'place' : 'places'} ready to move in
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['All', 'Lands', 'Furnished'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setFilter({ ...filter, type: t })}
                  className={cn(
                    "px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter.type === t ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" : "bg-black/5 border-black/5 text-black/60 hover:text-black"
                  )}
                >
                  {t}
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
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
                <option value="name-az">Name (A-Z)</option>
                <option value="name-za">Name (Z-A)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-black/5 border-black/5 rounded-full px-6 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Up to L$ {filter.maxPrice}</span>
              <input 
                type="range" 
                min="500" 
                max="3000" 
                step="100"
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
              onClick={() => openGallery(property)}
              className={cn(
                "bento-card group h-[450px] cursor-pointer",
                idx === 0 && filter.type === 'All' ? "lg:col-span-1 md:col-span-2" : ""
              )}
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
              
              <div className="absolute bottom-8 left-8 z-20 space-y-3 text-left">
                <div className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase rounded-md w-fit mb-3",
                  property.status === 'available' ? "bg-amber-500 text-black" : "bg-white/20 text-white"
                )}>
                  {property.status === 'available' ? 'Available' : 'Rented'}
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-white">{property.name}</h3>
                <p className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                  {property.location} | PRIMA OCEAN
                </p>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-light text-white underline underline-offset-8 decoration-amber-500/50">
                      L$ {property.price} <span className="text-[10px] uppercase font-bold tracking-tighter opacity-60">/ week</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(property.slurl, '_blank');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
                    >
                      <MapPin size={12} />
                      Teleport
                    </button>
                  </div>
                  
                  {property.status === 'available' && (
                    <Link 
                      to="/resident"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                    >
                      <Key size={12} />
                      Rent Now
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {sortedAndFilteredProperties.length === 0 && (
            <div className="col-span-full py-20 text-center bg-black/5 rounded-[2rem] border-2 border-dashed border-black/10">
              <p className="text-black/40 uppercase tracking-[0.3em] font-bold text-sm">No properties found with these filters</p>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-12">
           <button className="px-12 py-5 rounded-full border border-black/10 hover:border-amber-500/50 bg-black/5 text-[10px] font-bold uppercase tracking-[0.2em] text-black flex items-center gap-3 transition-all hover:bg-amber-500/5">
             View All Properties <ExternalLink size={16} className="text-amber-500" />
           </button>
        </div>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-6xl w-full aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedProperty.gallery[currentImgIdx].type === 'video' ? (
                <video 
                  src={selectedProperty.gallery[currentImgIdx].url} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay 
                  loop
                />
              ) : (
                <img 
                  src={selectedProperty.gallery[currentImgIdx].url} 
                  alt={`${selectedProperty.name} view ${currentImgIdx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-end gap-6">
                    <div>
                      <h2 className="text-4xl font-bold text-white tracking-tighter">{selectedProperty.name}</h2>
                      <p className="text-amber-400 text-sm font-mono tracking-widest uppercase">{selectedProperty.location}</p>
                      
                      {(selectedProperty.bedrooms !== undefined || selectedProperty.bathrooms !== undefined) && (
                        <div className="flex gap-4 mt-2">
                          {selectedProperty.bedrooms !== undefined && selectedProperty.bedrooms > 0 && (
                            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                              {selectedProperty.bedrooms} {selectedProperty.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                            </span>
                          )}
                          {selectedProperty.bathrooms !== undefined && selectedProperty.bathrooms > 0 && (
                            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                              {selectedProperty.bathrooms} {selectedProperty.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                            </span>
                          )}
                        </div>
                      )}

                      {selectedProperty.description && (
                        <p className="mt-4 text-sm text-white/60 font-light max-w-md line-clamp-3">
                          {selectedProperty.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mb-1">
                      <button 
                        onClick={() => window.open(selectedProperty.slurl, '_blank')}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                      >
                        <MapPin size={14} />
                        Teleport to Location
                      </button>
                      
                      {selectedProperty.status === 'available' && (
                        <Link 
                          to="/resident"
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                          <Key size={14} />
                          Rent This Property
                        </Link>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={prevImg}
                    className="p-4 bg-black/40 hover:bg-amber-500 hover:text-black rounded-full transition-all text-white backdrop-blur-md"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  
                  <div className="flex gap-2">
                    {selectedProperty.gallery.map((_: any, i: number) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === currentImgIdx ? "w-8 bg-amber-500" : "bg-white/20"
                        )}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={nextImg}
                    className="p-4 bg-black/40 hover:bg-amber-500 hover:text-black rounded-full transition-all text-white backdrop-blur-md"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
