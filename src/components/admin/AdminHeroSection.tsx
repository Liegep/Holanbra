import React from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Loader2, 
  Save 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminHeroSectionProps {
  heroContent: any;
  setHeroContent: (val: any | ((prev: any) => any)) => void;
  videos: any[];
  isUploadingSlot: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: any, idx?: number) => void;
  handleSaveHero: () => void;
}

export function AdminHeroSection({
  heroContent,
  setHeroContent,
  videos,
  isUploadingSlot,
  handleFileUpload,
  handleSaveHero
}: AdminHeroSectionProps) {
  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeroContent((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div className="text-left">
        <h3 className="text-2xl font-bold font-display text-white">Hero Section</h3>
        <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Manage your website branding and main visuals</p>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          <div className="space-y-4 text-left">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
               < ImageIcon size={14} /> Background Photo
            </label>
            <div className="relative group aspect-video rounded-[32px] overflow-hidden border-2 border-white/5 bg-zinc-900 shadow-2xl">
              {heroContent.backgroundImage ? (
                <img src={heroContent.backgroundImage} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40" referrerPolicy="no-referrer" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <ImageIcon size={48} />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <label className="px-6 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-amber-400 transform hover:scale-105 transition-all">
                   <input 
                     type="file" 
                     className="hidden" 
                     accept="image/*"
                     onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                     disabled={isUploadingSlot === 'backgroundImage'}
                   />
                   {isUploadingSlot === 'backgroundImage' ? "Uploading..." : "Change Background"}
                </label>
              </div>

              {isUploadingSlot === 'backgroundImage' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                   <Loader2 className="text-amber-500 animate-spin" size={32} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
               < ImageIcon size={14} /> Featured Photos Grid
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className={cn(
                  "relative group aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 transition-all",
                  idx % 2 !== 0 && "md:translate-y-6"
                )}>
                  {heroContent.gridImages[idx] ? (
                    <img src={heroContent.gridImages[idx]} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/5">
                      <ImageIcon size={24} />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <label className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-500 hover:text-black transition-all">
                       <input 
                         type="file" 
                         className="hidden" 
                         accept="image/*"
                         onChange={(e) => handleFileUpload(e, 'gridImage', idx)}
                         disabled={isUploadingSlot === `grid-${idx}`}
                       />
                       <Plus size={18} />
                    </label>
                  </div>

                  {isUploadingSlot === `grid-${idx}` && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                       <Loader2 className="text-amber-500 animate-spin" size={24} />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 text-[8px] font-black text-white/20 uppercase tracking-tighter">Slot {idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Badge Text</label>
                <input 
                  type="text"
                  name="badgeText"
                  value={heroContent.badgeText}
                  onChange={handleHeroInputChange}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Title</label>
                <input 
                  type="text"
                  name="title1"
                  value={heroContent.title1}
                  onChange={handleHeroInputChange}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Italic Secondary Title</label>
                <input 
                  type="text"
                  name="title2"
                  value={heroContent.title2}
                  onChange={handleHeroInputChange}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hero Video Selection</label>
                <select 
                  name="virtualTourUrl"
                  value={heroContent.virtualTourUrl}
                  onChange={(e) => setHeroContent((prev: any) => ({ ...prev, virtualTourUrl: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-white/40">Select a video</option>
                  {videos.map(v => (
                    <option key={v.id} value={v.url} className="bg-zinc-900 text-white">{v.name}</option>
                  ))}
                </select>
                <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">
                  The selected video will play in the background of your hero section.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-left border-l border-white/5 pl-8">
               <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">About Us Photo</label>
               <div className="relative group aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                  {heroContent.aboutImage ? (
                    <img src={heroContent.aboutImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/5">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <input 
                       type="file" 
                       className="hidden" 
                       accept="image/*"
                       onChange={(e) => handleFileUpload(e, 'aboutImage')}
                       disabled={isUploadingSlot === 'aboutImage'}
                     />
                     <div className="p-3 bg-white text-black rounded-xl">
                        <Plus size={18} />
                     </div>
                  </label>

                  {isUploadingSlot === 'aboutImage' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <Loader2 className="text-amber-500 animate-spin" size={24} />
                    </div>
                  )}
               </div>
            </div>
          </div>

          <button 
            onClick={handleSaveHero}
            className="w-full py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl"
          >
            <Save size={18} /> SAVE ALL CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}
