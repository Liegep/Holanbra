import React from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Loader2, 
  Save, 
  Trash2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminGalleryManagerProps {
  galleryImages: any[];
  galleryFormData: any;
  setGalleryFormData: (val: any) => void;
  isUploadingSlot: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: string) => void;
  handleGallerySave: () => void;
  handleDeleteGallery: (id: number) => void;
}

export function AdminGalleryManager({
  galleryImages,
  galleryFormData,
  setGalleryFormData,
  isUploadingSlot,
  handleFileUpload,
  handleGallerySave,
  handleDeleteGallery
}: AdminGalleryManagerProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl space-y-12">
      <div className="text-left">
        <h3 className="text-2xl font-bold font-display text-white">{t('admin.gallery.title')}</h3>
        <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{t('admin.gallery.subtitle')}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-card p-8 border-white/5 space-y-6">
              <div className="space-y-4 text-left">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t('admin.buttons.add_photo')}</label>
                <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 hover:border-amber-500/50 transition-all">
                   {galleryFormData.imageUrl ? (
                     <img src={galleryFormData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-3">
                        <ImageIcon size={32} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Choose Photo</span>
                     </div>
                   )}
                   
                   <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'gallery')}
                        disabled={isUploadingSlot === 'gallery'}
                      />
                      <div className="bg-white text-black p-3 rounded-full">
                        <Plus size={20} />
                      </div>
                   </label>

                   {isUploadingSlot === 'gallery' && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="text-amber-500 animate-spin" size={24} />
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.fields.caption')}</label>
                <input 
                  type="text"
                  value={galleryFormData.caption}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                  placeholder="e.g., Luxury Shoreline"
                />
              </div>

              <button 
                onClick={handleGallerySave}
                disabled={!galleryFormData.imageUrl || !!isUploadingSlot}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center gap-3 hover:bg-amber-400 transition-all uppercase tracking-widest text-[10px] disabled:opacity-30"
              >
                <Save size={16} /> {t('admin.buttons.add_to_collection', 'Add to Collection')}
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('admin.fields.current_gallery', 'Current Gallery')} ({galleryImages.length})</label>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryImages.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl bg-zinc-900 overflow-hidden border border-white/5 hover:border-amber-500/50 transition-all">
                <img src={img.url} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" referrerPolicy="no-referrer" />
                
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                   <p className="text-[9px] text-white font-bold truncate leading-tight">{img.caption || "Untitled"}</p>
                </div>

                <div className="absolute top-2 right-2 flex gap-2 translate-y-[-120%] group-hover:translate-y-0 transition-transform">
                  <button 
                    onClick={() => handleDeleteGallery(img.id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-500/90 text-white rounded-full hover:bg-red-600 shadow-xl"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {galleryImages.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                 <p className="text-white/10 text-[10px] uppercase font-black tracking-widest">No atmosphere photos registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
