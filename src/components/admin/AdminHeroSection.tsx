import React from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Loader2, 
  Save,
  Video,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface AdminHeroSectionProps {
  heroContent: any;
  setHeroContent: (val: any | ((prev: any) => any)) => void;
  isUploadingSlot: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: any, idx?: number) => void;
  handleSaveHero: () => void;
}

export function AdminHeroSection({
  heroContent,
  setHeroContent,
  isUploadingSlot,
  handleFileUpload,
  handleSaveHero
}: AdminHeroSectionProps) {
  const { t } = useTranslation();
  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeroContent((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div className="text-left">
        <h3 className="text-2xl font-bold font-display text-white">{t('admin.hero.title')}</h3>
        <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{t('admin.hero.subtitle')}</p>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                 < ImageIcon size={14} /> {t('admin.hero.background_photo')}
              </label>
              <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-white/5 bg-zinc-900 shadow-2xl">
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
                     {isUploadingSlot === 'backgroundImage' ? t('admin.hero.uploading') : t('admin.hero.change_background')}
                  </label>
                </div>

                {isUploadingSlot === 'backgroundImage' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                     <Loader2 className="text-amber-500 animate-spin" size={32} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 text-left border-l border-white/5 pl-8">
               <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('admin.hero.about_photo')}</label>
               <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-white/5 bg-zinc-900 shadow-2xl">
                  {heroContent.aboutImage ? (
                    <img src={heroContent.aboutImage} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40" referrerPolicy="no-referrer" />
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
                         onChange={(e) => handleFileUpload(e, 'aboutImage')}
                         disabled={isUploadingSlot === 'aboutImage'}
                       />
                       <div className="flex items-center gap-2">
                         {isUploadingSlot === 'aboutImage' ? t('admin.hero.uploading') : t('admin.hero.change_background')}
                       </div>
                    </label>
                  </div>

                  {isUploadingSlot === 'aboutImage' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                       <Loader2 className="text-amber-500 animate-spin" size={32} />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.hero.badge_text')}</label>
              <input 
                type="text"
                name="badgeText"
                value={heroContent.badgeText}
                onChange={handleHeroInputChange}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveHero}
            className="w-full py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl"
          >
            <Save size={18} /> {t('admin.hero.save_all')}
          </button>
        </div>
      </div>
    </div>
  );
}
